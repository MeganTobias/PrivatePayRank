"use client";

import { useApp } from "../providers";
import { StatisticsChart } from "@/components/StatisticsChart";
import Link from "next/link";

export default function StatisticsPage() {
  const { 
    totalSubmissions, 
    averageIncome, 
    distribution, 
    isLoading, 
    refreshData, 
    calculateRealStatistics,
    message 
  } = useApp();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-teal-900 dark:text-teal-50 mb-4">
            Income Statistics
          </h1>
          <p className="text-teal-700 dark:text-teal-300 mb-6">
            Aggregated income distribution computed from encrypted data
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Refreshing..." : "🔄 Refresh Data"}
            </button>
            
            <button
              onClick={calculateRealStatistics}
              disabled={isLoading}
              className="px-6 py-2 bg-accent hover:bg-teal-400 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Calculating..." : "📊 Calculate Statistics"}
            </button>
          </div>
          
          {message && (
            <div className="mt-4 text-sm text-teal-600 dark:text-teal-400 text-center">
              {message}
            </div>
          )}
        </div>

        <StatisticsChart
          distribution={distribution}
          totalSubmissions={totalSubmissions}
          averageIncome={averageIncome}
        />

        {/* Privacy Notice */}
        <div className="mt-8 glass dark:glass-dark p-6 rounded-lg border border-teal-200 dark:border-teal-800">
          <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-3">
            📊 About These Statistics
          </h3>
          <div className="text-sm text-teal-600 dark:text-teal-400 space-y-2">
            <p>
              • All income data is stored encrypted on-chain using FHEVM technology
            </p>
            <p>
              • Aggregate statistics are computed without revealing individual incomes
            </p>
            <p>
              • Only you can decrypt your own submitted income data
            </p>
            <p>
              • The distribution shows how many people fall into each income range
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/submit"
            className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            Submit Your Income
          </Link>
          <Link
            href="/profile"
            className="px-6 py-3 glass dark:glass-dark border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 rounded-lg hover:border-teal-500 dark:hover:border-teal-500 transition-all"
          >
            View My Profile
          </Link>
        </div>
      </div>
    </div>
  );
}





