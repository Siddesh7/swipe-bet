// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PredictionMarketplace is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    struct Prediction {
        address creator;
        string question;
        string imageUri;
        uint256 resolutionTime;
        uint256 bettingEndTime;
        bool isResolved;
        bool outcome;
        uint256 totalYesAmount;
        uint256 totalNoAmount;
        bool exists;
    }

    struct PredictionView {
        uint256 id;
        address creator;
        string question;
        string imageUri;
        uint256 resolutionTime;
        uint256 bettingEndTime;
        bool isResolved;
        bool outcome;
        uint256 totalYesAmount;
        uint256 totalNoAmount;
    }

    struct Bet {
        uint256 amount;
        bool choice; // true for Yes, false for No
        bool claimed;
    }

    uint256 public constant PLATFORM_FEE = 2; // 2% platform fee
    uint256 public constant MAX_URI_LENGTH = 300; // Maximum length for imageUri
    uint256 public constant MIN_BETTING_DURATION = 1 hours;
    uint256 public constant MAX_BETTING_DURATION = 90 days;
    uint256 public constant MIN_RESOLUTION_BUFFER = 1 days;
    uint256 public constant MAX_RESOLUTION_DURATION = 180 days;
    
    uint256 public predictionCounter;
    IERC20 public immutable usdc;
    
    mapping(uint256 => Prediction) public predictions;
    mapping(uint256 => mapping(address => Bet)) public bets;
    mapping(address => uint256) public userBalances;
    
    event PredictionCreated(
        uint256 indexed predictionId,
        address indexed creator,
        string question,
        string imageUri,
        uint256 resolutionTime,
        uint256 bettingEndTime
    );
    
    event BetPlaced(
        uint256 indexed predictionId,
        address indexed bettor,
        bool choice,
        uint256 amount
    );
    
    event PredictionResolved(
        uint256 indexed predictionId,
        bool outcome
    );
    
    event WinningsClaimed(
        uint256 indexed predictionId,
        address indexed bettor,
        uint256 amount
    );

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);

    modifier validPredictionId(uint256 _predictionId) {
        require(predictions[_predictionId].exists, "Prediction does not exist");
        _;
    }

    modifier validImageUri(string memory _imageUri) {
        require(bytes(_imageUri).length > 0, "Image URI cannot be empty");
        require(bytes(_imageUri).length <= MAX_URI_LENGTH, "Image URI too long");
        require(
            _startsWithValidProtocol(_imageUri),
            "Image URI must start with http://, https://, or ipfs://"
        );
        _;
    }

    constructor(address _usdc) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
        predictionCounter = 0;
    }

    function _startsWithValidProtocol(string memory _uri) internal pure returns (bool) {
        bytes memory uri = bytes(_uri);
        return (
            _startsWith(uri, "http://") ||
            _startsWith(uri, "https://") ||
            _startsWith(uri, "ipfs://")
        );
    }

    function _startsWith(bytes memory _full, string memory _prefix) internal pure returns (bool) {
        bytes memory prefix = bytes(_prefix);
        if (prefix.length > _full.length) return false;
        for (uint256 i = 0; i < prefix.length; i++) {
            if (_full[i] != prefix[i]) return false;
        }
        return true;
    }

    function deposit(uint256 _amount) external whenNotPaused nonReentrant {
        require(_amount > 0, "Amount must be positive");
        
        userBalances[msg.sender] += _amount;
        usdc.safeTransferFrom(msg.sender, address(this), _amount);
        
        emit Deposit(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external whenNotPaused nonReentrant {
        require(_amount > 0, "Amount must be positive");
        require(userBalances[msg.sender] >= _amount, "Insufficient balance");
        
        userBalances[msg.sender] -= _amount;
        usdc.safeTransfer(msg.sender, _amount);
        
        emit Withdrawal(msg.sender, _amount);
    }

    function createPrediction(
        string memory _question,
        string memory _imageUri,
        uint256 _bettingDuration,
        uint256 _resolutionDuration
    ) 
        external 
        whenNotPaused 
        validImageUri(_imageUri)
        returns (uint256) 
    {
        require(bytes(_question).length > 0, "Question cannot be empty");
        require(_bettingDuration >= MIN_BETTING_DURATION, "Betting duration too short");
        require(_bettingDuration <= MAX_BETTING_DURATION, "Betting duration too long");
        require(_resolutionDuration > _bettingDuration + MIN_RESOLUTION_BUFFER, 
                "Resolution buffer too short");
        require(_resolutionDuration <= MAX_RESOLUTION_DURATION, "Resolution duration too long");
        
        uint256 predictionId = predictionCounter++;
        uint256 bettingEndTime = block.timestamp + _bettingDuration;
        uint256 resolutionTime = block.timestamp + _resolutionDuration;
        
        predictions[predictionId] = Prediction({
            creator: msg.sender,
            question: _question,
            imageUri: _imageUri,
            resolutionTime: resolutionTime,
            bettingEndTime: bettingEndTime,
            isResolved: false,
            outcome: false,
            totalYesAmount: 0,
            totalNoAmount: 0,
            exists: true
        });
        
        emit PredictionCreated(
            predictionId,
            msg.sender,
            _question,
            _imageUri,
            resolutionTime,
            bettingEndTime
        );
        
        return predictionId;
    }

    function placeBet(
        uint256 _predictionId, 
        bool _choice,
        uint256 _amount,
        address _sender
    ) 
        external 
        whenNotPaused
        nonReentrant 
        validPredictionId(_predictionId)
    {
        Prediction storage prediction = predictions[_predictionId];
        
        require(!prediction.isResolved, "Prediction already resolved");
        require(block.timestamp < prediction.bettingEndTime, "Betting period ended");
        require(_amount > 0, "Bet amount must be positive");
        require(userBalances[_sender] >= _amount, "Insufficient balance");
        
        userBalances[_sender] -= _amount;
        
        if (_choice) {
            prediction.totalYesAmount += _amount;
        } else {
            prediction.totalNoAmount += _amount;
        }
        
        bets[_predictionId][_sender] = Bet({
            amount: _amount,
            choice: _choice,
            claimed: false
        });
        
        emit BetPlaced(_predictionId, _sender, _choice, _amount);
    }

    function resolvePrediction(uint256 _predictionId, bool _outcome) 
        external 
        whenNotPaused
        validPredictionId(_predictionId)
    {
        Prediction storage prediction = predictions[_predictionId];
        
        require(msg.sender == prediction.creator, "Only creator can resolve");
        require(!prediction.isResolved, "Already resolved");
        require(block.timestamp >= prediction.bettingEndTime, "Betting period not ended");
        require(block.timestamp <= prediction.resolutionTime, "Resolution period expired");
        
        prediction.isResolved = true;
        prediction.outcome = _outcome;
        
        emit PredictionResolved(_predictionId, _outcome);
    }

    function claimWinnings(uint256 _predictionId) 
        external 
        whenNotPaused
        nonReentrant 
        validPredictionId(_predictionId)
    {
        Prediction storage prediction = predictions[_predictionId];
        Bet storage bet = bets[_predictionId][msg.sender];
        
        require(prediction.isResolved, "Prediction not resolved yet");
        require(bet.amount > 0, "No bet placed");
        require(!bet.claimed, "Winnings already claimed");
        require(bet.choice == prediction.outcome, "Bet on wrong outcome");
        
        uint256 totalPool = prediction.totalYesAmount + prediction.totalNoAmount;
        uint256 winningPool = prediction.outcome ? 
            prediction.totalYesAmount : 
            prediction.totalNoAmount;
        
        uint256 platformFeeAmount = (totalPool * PLATFORM_FEE) / 100;
        uint256 winningPoolAfterFee = totalPool - platformFeeAmount;
        uint256 winnings = (bet.amount * winningPoolAfterFee) / winningPool;
        
        bet.claimed = true;
        userBalances[msg.sender] += winnings;
        
        emit WinningsClaimed(_predictionId, msg.sender, winnings);
    }

    function getAllPredictions() external view returns (PredictionView[] memory) {
        PredictionView[] memory allPredictions = new PredictionView[](predictionCounter);
        
        for (uint256 i = 0; i < predictionCounter; i++) {
            Prediction storage pred = predictions[i];
            if (pred.exists) {
                allPredictions[i] = PredictionView({
                    id: i,
                    creator: pred.creator,
                    question: pred.question,
                    imageUri: pred.imageUri,
                    resolutionTime: pred.resolutionTime,
                    bettingEndTime: pred.bettingEndTime,
                    isResolved: pred.isResolved,
                    outcome: pred.outcome,
                    totalYesAmount: pred.totalYesAmount,
                    totalNoAmount: pred.totalNoAmount
                });
            }
        }
        
        return allPredictions;
    }

    function getActivePredictions() external view returns (PredictionView[] memory) {
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < predictionCounter; i++) {
            if (predictions[i].exists && !predictions[i].isResolved && 
                block.timestamp < predictions[i].bettingEndTime) {
                activeCount++;
            }
        }
        
        PredictionView[] memory activePredictions = new PredictionView[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < predictionCounter; i++) {
            Prediction storage pred = predictions[i];
            if (pred.exists && !pred.isResolved && 
                block.timestamp < pred.bettingEndTime) {
                activePredictions[currentIndex] = PredictionView({
                    id: i,
                    creator: pred.creator,
                    question: pred.question,
                    imageUri: pred.imageUri,
                    resolutionTime: pred.resolutionTime,
                    bettingEndTime: pred.bettingEndTime,
                    isResolved: pred.isResolved,
                    outcome: pred.outcome,
                    totalYesAmount: pred.totalYesAmount,
                    totalNoAmount: pred.totalNoAmount
                });
                currentIndex++;
            }
        }
        
        return activePredictions;
    }

    function getUserCreatedPredictions(address _user) 
        external 
        view 
        returns (PredictionView[] memory) 
    {
        // First, count predictions created by user
        uint256 count = 0;
        for (uint256 i = 0; i < predictionCounter; i++) {
            if (predictions[i].exists && predictions[i].creator == _user) {
                count++;
            }
        }
        
        // Create array of correct size
        PredictionView[] memory userPredictions = new PredictionView[](count);
        uint256 currentIndex = 0;
        
        // Fill array with predictions
        for (uint256 i = 0; i < predictionCounter; i++) {
            Prediction storage pred = predictions[i];
            if (pred.exists && pred.creator == _user) {
                userPredictions[currentIndex] = PredictionView({
                    id: i,
                    creator: pred.creator,
                    question: pred.question,
                    imageUri: pred.imageUri,
                    resolutionTime: pred.resolutionTime,
                    bettingEndTime: pred.bettingEndTime,
                    isResolved: pred.isResolved,
                    outcome: pred.outcome,
                    totalYesAmount: pred.totalYesAmount,
                    totalNoAmount: pred.totalNoAmount
                });
                currentIndex++;
            }
        }
        
        return userPredictions;
    }

 function getUserBets(address _user) 
    external 
    view 
    returns (PredictionView[] memory predictionViews, Bet[] memory userBets) 
{
    // First, count predictions where user has placed bets
    uint256 count = 0;
    for (uint256 i = 0; i < predictionCounter; i++) {
        Prediction storage pred = predictions[i];
        if (pred.exists && bets[i][_user].amount > 0) {
            count++;
        }
    }
    
    // Create arrays of correct size
    predictionViews = new PredictionView[](count);
    userBets = new Bet[](count);
    uint256 currentIndex = 0;
    
    // Fill arrays with predictions and corresponding bets
    for (uint256 i = 0; i < predictionCounter; i++) {
        Prediction storage pred = predictions[i];
        if (pred.exists && bets[i][_user].amount > 0) {
            predictionViews[currentIndex] = PredictionView({
                id: i,
                creator: pred.creator,
                question: pred.question,
                imageUri: pred.imageUri,
                resolutionTime: pred.resolutionTime,
                bettingEndTime: pred.bettingEndTime,
                isResolved: pred.isResolved,
                outcome: pred.outcome,
                totalYesAmount: pred.totalYesAmount,
                totalNoAmount: pred.totalNoAmount
            });
            
            userBets[currentIndex] = bets[i][_user];
            currentIndex++;
        }
    }
    
    return (predictionViews, userBets);
}
    function getPredictionDetails(uint256 _predictionId) 
        external 
        view 
        validPredictionId(_predictionId)
        returns (
            address creator,
            string memory question,
            string memory imageUri,
            uint256 resolutionTime,
            uint256 bettingEndTime,
            bool isResolved,
            bool outcome,
            uint256 totalYesAmount,
            uint256 totalNoAmount
        ) 
    {
        Prediction storage prediction = predictions[_predictionId];
        
        return (
            prediction.creator,
            prediction.question,
            prediction.imageUri,
            prediction.resolutionTime,
            prediction.bettingEndTime,
            prediction.isResolved,
            prediction.outcome,
            prediction.totalYesAmount,
            prediction.totalNoAmount
        );
    }

    function getBetDetails(uint256 _predictionId, address _bettor) 
        external 
        view 
        validPredictionId(_predictionId)
        returns (uint256 amount, bool choice, bool claimed) 
    {
        Bet storage bet = bets[_predictionId][_bettor];
        return (bet.amount, bet.choice, bet.claimed);
    }

    function getBalance() external view returns (uint256) {
        return userBalances[msg.sender];
    }

    function withdrawPlatformFees(address _to) external onlyOwner nonReentrant {
        require(_to != address(0), "Invalid address");
        uint256 platformFeesBalance = usdc.balanceOf(address(this)) - getTotalUserBalances();
        require(platformFeesBalance > 0, "No fees to withdraw");
        
        usdc.safeTransfer(_to, platformFeesBalance);
        emit PlatformFeesWithdrawn(_to, platformFeesBalance);
    }

    function getTotalUserBalances() public view returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}