"use client";

import { useApp } from "../providers";
import { IncomeSubmitForm } from "@/components/IncomeSubmitForm";
import Link from "next/link";

export default function SubmitPage() {
  const {
    address,
    isConnected,
    fhevmIsReady,
    hasSubmitted,
    submitIncome,
    updateIncome,
    isSubmitting,
    message,
    canSubmit,
    canUpdate,
  } = useApp();


  if (!isConnected || !address) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">🔌</div>
          <h1 className="text-3xl font-bold text-teal-900 dark:text-teal-50 mb-4">
            Wallet Not Connected
          </h1>
          <p className="text-teal-700 dark:text-teal-300 mb-8">
            Please connect your wallet to submit your income data.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (!fhevmIsReady) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">⏳</div>
          <h1 className="text-3xl font-bold text-teal-900 dark:text-teal-50 mb-4">
            Initializing FHEVM...
          </h1>
          <p className="text-teal-700 dark:text-teal-300">
            Please wait while we initialize the encryption system.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (income: number, label: string) => {
    if (hasSubmitted) {
      await updateIncome(income, label);
    } else {
      await submitIncome(income, label);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-teal-900 dark:text-teal-50 mb-4">
            {hasSubmitted ? "Update Your Income" : "Submit Your Income"}
          </h1>
          <p className="text-teal-700 dark:text-teal-300">
            {hasSubmitted
              ? "Update your encrypted income data on-chain"
              : "Share your income data privately using fully homomorphic encryption"}
          </p>
        </div>

        {hasSubmitted && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              ℹ️ You have already submitted your income. Use this form to update your data.
            </p>
          </div>
        )}

        <div className="glass dark:glass-dark p-8 rounded-lg border border-teal-200 dark:border-teal-800">
          <IncomeSubmitForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            message={message}
          />
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/statistics"
            className="px-6 py-3 glass dark:glass-dark border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 rounded-lg hover:border-teal-500 dark:hover:border-teal-500 transition-all"
          >
            View Statistics
          </Link>
          <Link
            href="/profile"
            className="px-6 py-3 glass dark:glass-dark border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 rounded-lg hover:border-teal-500 dark:hover:border-teal-500 transition-all"
          >
            My Profile
          </Link>
        </div>
      </div>
    </div>
  );
}




