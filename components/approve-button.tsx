import { PREDICTION_MARKET_ADDRESS, USDC_ADDRESS } from "@/constants";
import React, { useEffect, useState } from "react";
import { erc20Abi, parseEther } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

const ApproveButton = () => {
  const [hash, setHash] = useState<any>();
  const { writeContractAsync } = useWriteContract();
  const { data, isSuccess, isLoading } = useWaitForTransactionReceipt({
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

  return (
    <div>
      <button onClick={approveHandler}>Apporve</button>
    </div>
  );
};

export default ApproveButton;
