"use client";

interface ProfileCardProps {
  address: string;
  hasSubmitted: boolean;
  userLabel: string;
  decryptedIncome: number | null;
  isDecrypting: boolean;
  onDecrypt: () => Promise<number | undefined>;
  onUpdateIncome: () => void;
}

const getIncomeRange = (income: number): string => {
  if (income <= 3000) return "0 - 3,000";
  if (income <= 5000) return "3,001 - 5,000";
  if (income <= 8000) return "5,001 - 8,000";
  if (income <= 12000) return "8,001 - 12,000";
  if (income <= 20000) return "12,001 - 20,000";
  return "20,001+";
};

export function ProfileCard({
  address,
  hasSubmitted,
  userLabel,
  decryptedIncome,
  isDecrypting,
  onDecrypt,
  onUpdateIncome,
}: ProfileCardProps) {
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Info Card */}
      <div className="glass dark:glass-dark p-6 rounded-lg border border-teal-200 dark:border-teal-800">
        <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-4">
          Wallet Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-teal-600 dark:text-teal-400 mb-1">
              Connected Address
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 px-3 py-2 bg-teal-50 dark:bg-teal-900/30 rounded border border-teal-200 dark:border-teal-800 text-sm font-mono text-teal-700 dark:text-teal-300">
                {address}
              </code>
              <button
                onClick={handleCopyAddress}
                className="p-2 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded transition-colors"
                title="Copy address"
              >
                <svg
                  className="w-5 h-5 text-teal-600 dark:text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-teal-600 dark:text-teal-400 mb-1">
              Submission Status
            </label>
            <div
              className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${
                hasSubmitted
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  hasSubmitted ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
              <span className="text-sm font-semibold">
                {hasSubmitted ? "Income Submitted" : "Not Submitted"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Income Data Card */}
      {hasSubmitted && (
        <div className="glass dark:glass-dark p-6 rounded-lg border border-teal-200 dark:border-teal-800">
          <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-4">
            Your Income Data
          </h3>

          <div className="space-y-4">
            {userLabel && (
              <div>
                <label className="block text-sm text-teal-600 dark:text-teal-400 mb-1">
                  Label
                </label>
                <div className="px-3 py-2 bg-teal-50 dark:bg-teal-900/30 rounded border border-teal-200 dark:border-teal-800 text-sm text-teal-700 dark:text-teal-300">
                  {userLabel}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-teal-600 dark:text-teal-400 mb-1">
                Income Range
              </label>
              {decryptedIncome !== null ? (
                <div className="space-y-2">
                  <div className="px-4 py-3 bg-teal-50 dark:bg-teal-900/30 rounded-lg border border-teal-200 dark:border-teal-800">
                    <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                      ${getIncomeRange(decryptedIncome)}
                    </div>
                    <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                      /month
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Decrypted successfully</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onDecrypt}
                  disabled={isDecrypting}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    isDecrypting
                      ? "bg-teal-300 dark:bg-teal-700 text-white cursor-not-allowed"
                      : "bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {isDecrypting ? "Decrypting..." : "🔓 Decrypt My Income"}
                </button>
              )}
            </div>

            {/* Update Button */}
            <button
              onClick={onUpdateIncome}
              className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-teal-500 text-teal-700 dark:text-teal-300 rounded-lg font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all"
            >
              Update Income
            </button>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="glass dark:glass-dark p-4 rounded-lg border border-teal-200 dark:border-teal-800">
        <div className="flex items-start space-x-3">
          <div className="text-xl">ℹ️</div>
          <div>
            <h4 className="text-sm font-semibold text-teal-700 dark:text-teal-300 mb-1">
              Privacy Information
            </h4>
            <ul className="text-xs text-teal-600 dark:text-teal-400 space-y-1">
              <li>• Your income is stored encrypted on-chain</li>
              <li>• Only you can decrypt your own data</li>
              <li>• Aggregate statistics don&apos;t reveal individual incomes</li>
              <li>• Your wallet address is not linked to your label</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

