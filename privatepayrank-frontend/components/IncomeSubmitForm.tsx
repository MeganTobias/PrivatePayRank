"use client";

import { useState } from "react";

interface IncomeRange {
  label: string;
  value: number;
  range: string;
}

const incomeRanges: IncomeRange[] = [
  { label: "0 - 3,000", value: 1500, range: "0-3,000" },
  { label: "3,001 - 5,000", value: 4000, range: "3,001-5,000" },
  { label: "5,001 - 8,000", value: 6500, range: "5,001-8,000" },
  { label: "8,001 - 12,000", value: 10000, range: "8,001-12,000" },
  { label: "12,001 - 20,000", value: 16000, range: "12,001-20,000" },
  { label: "20,001+", value: 25000, range: "20,001+" },
];

interface IncomeSubmitFormProps {
  onSubmit: (income: number, label: string) => Promise<void>;
  isSubmitting: boolean;
  message?: string;
}

export function IncomeSubmitForm({
  onSubmit,
  isSubmitting,
  message,
}: IncomeSubmitFormProps) {
  const [selectedRange, setSelectedRange] = useState<number | null>(null);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedRange === null) {
      setError("Please select an income range");
      return;
    }

    try {
      await onSubmit(selectedRange, label);
      // Reset form on success
      setSelectedRange(null);
      setLabel("");
    } catch (err: any) {
      setError(err.message || "Failed to submit");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Income Range Selection */}
      <div>
        <label className="block text-sm font-semibold text-teal-700 dark:text-teal-300 mb-3">
          Select Your Monthly Income Range (USD)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {incomeRanges.map((range, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedRange(range.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedRange === range.value
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30 shadow-md"
                  : "border-teal-200 dark:border-teal-800 hover:border-teal-400 dark:hover:border-teal-600"
              }`}
            >
              <div className="text-lg font-semibold text-teal-700 dark:text-teal-300">
                ${range.label}
              </div>
              <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                /month
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Anonymous Label (Optional) */}
      <div>
        <label className="block text-sm font-semibold text-teal-700 dark:text-teal-300 mb-2">
          Anonymous Label (Optional)
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., Software Engineer, Designer, etc."
          maxLength={50}
          className="w-full px-4 py-3 rounded-lg border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-teal-400"
        />
        <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
          This will be displayed anonymously (not linked to your address)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Status Message */}
      {message && (
        <div className="p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
          <p className="text-sm text-teal-700 dark:text-teal-300">{message}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || selectedRange === null}
        className={`w-full py-4 rounded-lg font-semibold text-white transition-all shadow-lg ${
          isSubmitting || selectedRange === null
            ? "bg-teal-300 dark:bg-teal-700 cursor-not-allowed"
            : "bg-teal-500 hover:bg-teal-600 hover:shadow-xl"
        }`}
      >
        {isSubmitting ? "Submitting..." : "Submit Encrypted Income"}
      </button>

      {/* Privacy Notice */}
      <div className="p-4 glass dark:glass-dark rounded-lg border border-teal-200 dark:border-teal-800">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">🔒</div>
          <div>
            <h4 className="text-sm font-semibold text-teal-700 dark:text-teal-300 mb-1">
              Privacy Protected
            </h4>
            <p className="text-xs text-teal-600 dark:text-teal-400">
              Your income data will be encrypted using FHEVM technology before
              being submitted to the blockchain. Only you can decrypt your own
              data. Aggregate statistics are computed without revealing individual
              incomes.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}





