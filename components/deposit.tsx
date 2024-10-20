import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useWriteContract } from "wagmi";
import { abi } from "@/lib/abi.json";


const deposit = () => {
    const [amount, setAmount] = useState(0);
    const { writeContract } = useWriteContract();
    const handleDeposit = () => {
        console.log(amount);
    }
  return (
    <div >
      <Dialog >
        <DialogTrigger>
            <Button className="bg-green-500 text-white hover:bg-green-600">
                <Plus size={20} color="white" />
            </Button>
         </DialogTrigger>
        <DialogContent>
          <DialogHeader className="flex flex-col gap-4">
            <DialogTitle>Deposit USDC</DialogTitle>
                <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(parseInt(e.target.value))} />
                <Button onClick={handleDeposit}>Deposit</Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default deposit
