import PredictionMarkets from "@/components/all-markets";
import React from "react";

const Page = () => {
  return (
    <PredictionMarkets
      contractAddress={process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS}
    />
  );
};

export default Page;
