import {PREDICTION_MARKET_ADDRESS, USDC_ADDRESS} from "@/constants";
import React, {useEffect, useState} from "react";
import {erc20Abi, parseEther} from "viem";
import {useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {Button} from "./ui/button";

const ApproveButton = ({onSuccess}: {onSuccess: (success: any) => void}) => {
  const [hash, setHash] = useState<any>();
  const {writeContractAsync} = useWriteContract();
  const {data, isSuccess, isLoading} = useWaitForTransactionReceipt({
    hash,
  });

  const approveHandler = async () => {
    const hash = await writeContractAsync({
      abi: erc20Abi,
      functionName: "approve",
      args: [PREDICTION_MARKET_ADDRESS, parseEther("100000000000000000000000")],
      address: USDC_ADDRESS,
    });
    setHash(hash);
  };

  useEffect(() => {
    if (isSuccess) {
      onSuccess(data);
    }
  }, [isSuccess]);

  return (
    <div>
      <Button
        onClick={approveHandler}
        disabled={isLoading}
        className="px-4 py-2 w-full rounded disabled:opacity-50"
      >
        {isLoading ? "Approving..." : "Approve"}
      </Button>
    </div>
  );
};

export default ApproveButton;
