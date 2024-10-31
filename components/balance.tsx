import React, {useState, useEffect} from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
  useReadContract,
  useSimulateContract,
} from "wagmi";
import {erc20Abi, parseUnits} from "viem";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {
  Loader2,
  ArrowRight,
  Check,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import {PREDICTION_MARKET_ADDRESS, USDC_ADDRESS} from "../constants/index";
import PREDICTION_MARKET_ABI from "../lib/abi.json";
import DepositButton from "./deposit-button";
import ApproveButton from "./approve-button";

interface DepositProps {
  className?: string;
  onSuccess?: () => void;
}

interface TransactionStatus {
  isSuccess: boolean;
  isError: boolean;
  error?: Error;
  message?: string;
}

const PRESET_AMOUNTS = [5, 10, 15];

export const Balance: React.FC<DepositProps> = ({className, onSuccess}) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [userBalance, setUserBalance] = useState<any>();
  const [needsApproval, setNeedsApproval] = useState(true);
  const [txStatus, setTxStatus] = useState<TransactionStatus>({
    isSuccess: false,
    isError: false,
  });

  const {address} = useAccount();

  const {data: usdcBalance, refetch: refetchUsdcBalance} = useBalance({
    address,
    token: USDC_ADDRESS,
  });

  const {data: allowance, refetch: refetchAllowance} = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, PREDICTION_MARKET_ADDRESS] : undefined,
  });

  const {data: contractBalance, refetch: refetchContractBalance} =
    useReadContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "getBalance",
      account: address,
    });

  useEffect(() => {
    setUserBalance(contractBalance);
  }, [contractBalance]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`bg-red-600 hover:bg-red-700 ${className}`}>
          Deposit USDC
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-2 border-red-600 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit USDC</DialogTitle>
          <DialogDescription className="text-gray-400">
            Deposit USDC to participate in prediction markets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {userBalance && <p>{userBalance}</p>}
          <div className="flex gap-2">
            {PRESET_AMOUNTS.map((presetAmount) => (
              <Button
                key={presetAmount}
                variant="outline"
                className={`flex-1 ${
                  selectedPreset === presetAmount
                    ? "bg-red-600 text-white"
                    : "text-white"
                }`}
                onClick={() => {
                  setAmount(presetAmount.toString());
                  setSelectedPreset(presetAmount);
                }}
              >
                ${presetAmount}
              </Button>
            ))}
          </div>

          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setSelectedPreset(null);
              }}
              className="pl-10 bg-transparent text-white"
              placeholder="Enter amount"
            />
          </div>

          {txStatus.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {txStatus.message || "Transaction failed"}
              </AlertDescription>
            </Alert>
          )}

          {txStatus.isSuccess && (
            <Alert className="bg-green-600">
              <Check className="h-4 w-4" />
              <AlertDescription>{txStatus.message}</AlertDescription>
            </Alert>
          )}

          {allowance! > 0 ? (
            <DepositButton
              amount={amount}
              onError={(e) => {
                console.log(e);
              }}
              onSuccess={(e) => {
                setOpen(false);
                refetchContractBalance();
              }}
            />
          ) : (
            <ApproveButton
              onSuccess={() => {
                setNeedsApproval(false);
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Balance;
