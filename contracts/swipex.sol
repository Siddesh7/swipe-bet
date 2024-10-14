// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GoalBetting {
    struct Bet {
        address creator;
        string goal;
        uint256 stakingAmount;
        uint256 totalParticipants;
        uint256 currentParticipants;
        mapping(address => bool) participants;
        mapping(address => bool) completedGoal;
        mapping(address => address) votes;
        mapping(address => uint256) voteCount;
        bool isActive;
        bool isFinalized;
        uint256 creationTime;
        uint256 deadline;
        uint256 votingDeadline;
        address winner;
    }

    mapping(uint256 => Bet) public bets;
    uint256[] public betCodes;
    uint256 public nextBetCode = 100000; // Start from 100000 to ensure 6 digits

    uint256 public constant MAX_DURATION = 365 days;
    uint256 public constant MIN_DURATION = 1 days;
    uint256 public constant VOTING_DURATION = 7 days;

    event BetCreated(uint256 indexed betCode, address indexed creator, string goal, uint256 stakingAmount, uint256 totalParticipants, uint256 deadline, uint256 votingDeadline);
    event BetJoined(uint256 indexed betCode, address indexed participant);
    event GoalCompleted(uint256 indexed betCode, address indexed participant);
    event VoteCast(uint256 indexed betCode, address indexed voter, address indexed votedFor);
    event BetFinalized(uint256 indexed betCode, address winner, uint256 winningVoteCount);
    event StakeWithdrawn(uint256 indexed betCode, address indexed participant, uint256 amount);
    event BetCancelled(uint256 indexed betCode);

    function createBet(string memory _goal, uint256 _stakingAmount, uint256 _totalParticipants, uint256 _duration) public payable returns (uint256) {
        require(msg.value == _stakingAmount, "Must send exact staking amount");
        require(_totalParticipants > 0, "Total participants must be at least 1");
        require(_duration >= MIN_DURATION && _duration <= MAX_DURATION, "Invalid duration");

        uint256 betCode = nextBetCode++;
        if (nextBetCode > 999999) {
            nextBetCode = 100000; // Reset to 100000 if we reach 999999
        }
        
        Bet storage newBet = bets[betCode];
        newBet.creator = msg.sender;
        newBet.goal = _goal;
        newBet.stakingAmount = _stakingAmount;
        newBet.totalParticipants = _totalParticipants;
        newBet.currentParticipants = 1;
        newBet.participants[msg.sender] = true;
        newBet.isActive = _totalParticipants > 1; // Single-participant bets are not active for joining
        newBet.creationTime = block.timestamp;
        newBet.deadline = block.timestamp + _duration;
        newBet.votingDeadline = newBet.deadline + VOTING_DURATION;

        betCodes.push(betCode);

        emit BetCreated(betCode, msg.sender, _goal, _stakingAmount, _totalParticipants, newBet.deadline, newBet.votingDeadline);
        return betCode;
    }

    function joinBet(uint256 _betCode) public payable {
        Bet storage bet = bets[_betCode];
        require(bet.isActive, "Bet is not active for joining");
        require(!bet.participants[msg.sender], "Already participating in this bet");
        require(msg.value == bet.stakingAmount, "Must send exact staking amount");
        require(bet.currentParticipants < bet.totalParticipants, "Bet is full");
        require(block.timestamp < bet.deadline, "Bet deadline has passed");

        bet.participants[msg.sender] = true;
        bet.currentParticipants++;

        if (bet.currentParticipants == bet.totalParticipants) {
            bet.isActive = false;
        }

        emit BetJoined(_betCode, msg.sender);
    }

    function completeGoal(uint256 _betCode) public {
        Bet storage bet = bets[_betCode];
        require(bet.participants[msg.sender], "Not a participant in this bet");
        require(!bet.completedGoal[msg.sender], "Goal already marked as completed");
        require(block.timestamp <= bet.deadline, "Bet deadline has passed");

        bet.completedGoal[msg.sender] = true;
        emit GoalCompleted(_betCode, msg.sender);
    }

    function vote(uint256 _betCode, address _votedFor) public {
        Bet storage bet = bets[_betCode];
        require(block.timestamp > bet.deadline && block.timestamp <= bet.votingDeadline, "Not within voting period");
        require(!bet.isFinalized, "Bet is already finalized");
        require(bet.participants[_votedFor], "Voted address is not a participant");
        require(bet.completedGoal[_votedFor], "Voted participant did not complete the goal");
        
        if (bet.totalParticipants > 1) {
            require(bet.participants[msg.sender], "Only participants can vote for multi-participant bets");
        }

        // Remove previous vote if exists
        if (bet.votes[msg.sender] != address(0)) {
            bet.voteCount[bet.votes[msg.sender]]--;
        }

        bet.votes[msg.sender] = _votedFor;
        bet.voteCount[_votedFor]++;

        emit VoteCast(_betCode, msg.sender, _votedFor);
    }

    function finalizeBet(uint256 _betCode) public {
        Bet storage bet = bets[_betCode];
        require(msg.sender == bet.creator, "Only creator can finalize the bet");
        require(block.timestamp > bet.votingDeadline, "Voting period has not ended");
        require(!bet.isFinalized, "Bet is already finalized");

        address winningParticipant = address(0);
        uint256 highestVotes = 0;

        for (uint256 i = 0; i < bet.currentParticipants; i++) {
            address participant = getParticipantAtIndex(_betCode, i);
            if (bet.voteCount[participant] > highestVotes) {
                winningParticipant = participant;
                highestVotes = bet.voteCount[participant];
            }
        }

        require(winningParticipant != address(0), "No valid winner found");

        bet.winner = winningParticipant;
        bet.isFinalized = true;
        emit BetFinalized(_betCode, winningParticipant, highestVotes);
    }

    function withdrawStake(uint256 _betCode) public {
        Bet storage bet = bets[_betCode];
        require(bet.isFinalized, "Bet is not finalized yet");
        require(msg.sender == bet.winner, "Only the winner can withdraw");

        uint256 amountToWithdraw = bet.stakingAmount * bet.currentParticipants;
        
        bet.participants[msg.sender] = false;
        payable(msg.sender).transfer(amountToWithdraw);

        emit StakeWithdrawn(_betCode, msg.sender, amountToWithdraw);
    }

    function cancelBet(uint256 _betCode) public {
        Bet storage bet = bets[_betCode];
        require(msg.sender == bet.creator, "Only creator can cancel the bet");
        require(bet.isActive || bet.totalParticipants == 1, "Bet cannot be cancelled");
        require(bet.currentParticipants < bet.totalParticipants || bet.totalParticipants == 1, "Cannot cancel a full bet");

        bet.isActive = false;
        bet.isFinalized = true;

        for (uint256 i = 0; i < bet.currentParticipants; i++) {
            address participant = getParticipantAtIndex(_betCode, i);
            payable(participant).transfer(bet.stakingAmount);
        }

        emit BetCancelled(_betCode);
    }

    function getParticipantAtIndex(uint256 _betCode, uint256 _index) public view returns (address) {
        Bet storage bet = bets[_betCode];
        require(_index < bet.currentParticipants, "Index out of bounds");

        uint256 count = 0;
        for (uint256 i = 0; i < betCodes.length; i++) {
            address potentialParticipant = address(uint160(uint256(keccak256(abi.encodePacked(_betCode, i)))));
            if (bet.participants[potentialParticipant]) {
                if (count == _index) {
                    return potentialParticipant;
                }
                count++;
            }
        }

        revert("Participant not found");
    }

    function getBetInfo(uint256 _betCode) public view returns (
        address creator,
        string memory goal,
        uint256 stakingAmount,
        uint256 totalParticipants,
        uint256 currentParticipants,
        bool isActive,
        bool isFinalized,
        uint256 creationTime,
        uint256 deadline,
        uint256 votingDeadline,
        address winner
    ) {
        Bet storage bet = bets[_betCode];
        return (
            bet.creator,
            bet.goal,
            bet.stakingAmount,
            bet.totalParticipants,
            bet.currentParticipants,
            bet.isActive,
            bet.isFinalized,
            bet.creationTime,
            bet.deadline,
            bet.votingDeadline,
            bet.winner
        );
    }

    function getAllBets() public view returns (uint256[] memory) {
        return betCodes;
    }

    function isParticipant(uint256 _betCode, address _participant) public view returns (bool) {
        return bets[_betCode].participants[_participant];
    }

    function hasCompletedGoal(uint256 _betCode, address _participant) public view returns (bool) {
        return bets[_betCode].completedGoal[_participant];
    }

    function getVoteCount(uint256 _betCode, address _participant) public view returns (uint256) {
        return bets[_betCode].voteCount[_participant];
    }
}