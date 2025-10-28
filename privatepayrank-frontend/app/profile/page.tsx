"use client";

import { useApp } from "../providers";
import { ProfileCard } from "@/components/ProfileCard";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const {
    isConnected,
    address,
    hasSubmitted,
    userLabel,
    decryptedIncome,
    isDecrypting,
    decryptUserIncome,
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
            Please connect your wallet to view your profile.
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

  const handleUpdateIncome = () => {
    router.push("/submit");
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-teal-900 dark:text-teal-50 mb-4">
            My Profile
          </h1>
          <p className="text-teal-700 dark:text-teal-300">
            View and manage your encrypted income data
          </p>
        </div>

        <ProfileCard
          address={address}
          hasSubmitted={hasSubmitted}
          userLabel={userLabel}
          decryptedIncome={decryptedIncome}
          isDecrypting={isDecrypting}
          onDecrypt={decryptUserIncome}
          onUpdateIncome={handleUpdateIncome}
        />

        {!hasSubmitted && (
          <div className="mt-8 text-center">
            <div className="glass dark:glass-dark p-8 rounded-lg border border-teal-200 dark:border-teal-800">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-2">
                You Haven&apos;t Submitted Yet
              </h3>
              <p className="text-teal-600 dark:text-teal-400 mb-6">
                Submit your income data to participate in the statistics and unlock your profile.
              </p>
              <Link
                href="/submit"
                className="inline-block px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Submit Income Now
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/statistics"
            className="px-6 py-3 glass dark:glass-dark border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 rounded-lg hover:border-teal-500 dark:hover:border-teal-500 transition-all"
          >
            View Statistics
          </Link>
          {!hasSubmitted && (
            <Link
              href="/submit"
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Submit Income
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

