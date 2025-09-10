"use client";

import React, { useState } from "react";
import TransactionsScreen from "@/components/TransactionsScreen";
import TransactionDetailScreen from "@/components/TransactionDetailScreen";

export default function Home() {
  const [currentView, setCurrentView] = useState<"transactions" | "detail">(
    "transactions"
  );
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(
    null
  );

  const handleViewDetail = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setCurrentView("detail");
  };

  const handleBackToTransactions = () => {
    setCurrentView("transactions");
    setSelectedTransactionId(null);
  };

  return (
    <div>
      {currentView === "transactions" ? (
        <TransactionsScreen onViewDetail={handleViewDetail} />
      ) : (
        <TransactionDetailScreen
          transactionId={selectedTransactionId || undefined}
          onBack={handleBackToTransactions}
        />
      )}
    </div>
  );
}
