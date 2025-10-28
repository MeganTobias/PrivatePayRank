"use client";

import Link from "next/link";
import { useApp } from "./providers";

export default function Home() {
  const { totalSubmissions, averageIncome, isConnected } = useApp();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-teal-900 dark:text-teal-50 mb-6">
          Private Pay Rank
        </h1>
        <p className="text-xl text-teal-700 dark:text-teal-200 mb-12">
          Privacy-Preserving Income Statistics Platform
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="glass dark:glass-dark p-6 rounded-lg">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold mb-2 text-teal-900 dark:text-teal-50">
              Privacy First
            </h3>
            <p className="text-sm text-teal-700 dark:text-teal-200">
              Your income data stays encrypted on-chain using FHEVM technology
            </p>
          </div>

          <div className="glass dark:glass-dark p-6 rounded-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2 text-teal-900 dark:text-teal-50">
              Encrypted Analytics
            </h3>
            <p className="text-sm text-teal-700 dark:text-teal-200">
              Compute aggregate statistics without revealing individual data
            </p>
          </div>

          <div className="glass dark:glass-dark p-6 rounded-lg">
            <div className="text-4xl mb-4">⛓️</div>
            <h3 className="text-lg font-semibold mb-2 text-teal-900 dark:text-teal-50">
              On-Chain Verified
            </h3>
            <p className="text-sm text-teal-700 dark:text-teal-200">
              All computations verified on Ethereum using smart contracts
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {isConnected ? (
            <Link
              href="/submit"
              className="inline-block px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Submit Your Income
            </Link>
          ) : (
            <div>
              <p className="text-teal-700 dark:text-teal-300 mb-4">
                Connect your wallet to get started
              </p>
              <p className="text-sm text-teal-600 dark:text-teal-400">
                Click &quot;Connect Wallet&quot; in the top right
              </p>
            </div>
          )}
        </div>

        <div className="mt-16 pt-8 border-t border-teal-200 dark:border-teal-800">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-teal-500">
                {totalSubmissions}
              </div>
              <div className="text-sm text-teal-600 dark:text-teal-400">
                Total Submissions
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-500">
                ${averageIncome > 0 ? averageIncome.toLocaleString() : "---"}
              </div>
              <div className="text-sm text-teal-600 dark:text-teal-400">
                Average Income
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-500">100%</div>
              <div className="text-sm text-teal-600 dark:text-teal-400">
                Privacy Protected
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
