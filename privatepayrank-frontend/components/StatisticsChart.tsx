"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface StatisticsChartProps {
  distribution: number[];
  totalSubmissions: number;
  averageIncome: number;
}

const rangeLabels = [
  "0-3K",
  "3-5K",
  "5-8K",
  "8-12K",
  "12-20K",
  "20K+",
];

const colors = [
  "#14B8A6", // Teal-500
  "#10B981", // Green-500
  "#06B6D4", // Cyan-500
  "#0EA5E9", // Sky-500
  "#3B82F6", // Blue-500
  "#6366F1", // Indigo-500
];

export function StatisticsChart({
  distribution,
  totalSubmissions,
  averageIncome,
}: StatisticsChartProps) {
  const chartData = distribution.map((count, index) => ({
    range: rangeLabels[index],
    count: count,
    percentage: totalSubmissions > 0 ? ((count / totalSubmissions) * 100).toFixed(1) : "0",
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass dark:glass-dark p-3 rounded-lg border border-teal-200 dark:border-teal-800">
          <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">
            ${payload[0].payload.range}/month
          </p>
          <p className="text-sm text-teal-600 dark:text-teal-400">
            Count: {payload[0].value}
          </p>
          <p className="text-xs text-teal-500 dark:text-teal-500">
            {payload[0].payload.percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass dark:glass-dark p-6 rounded-lg border border-teal-200 dark:border-teal-800">
          <div className="text-sm text-teal-600 dark:text-teal-400 mb-1">
            Total Submissions
          </div>
          <div className="text-3xl font-bold text-teal-700 dark:text-teal-300">
            {totalSubmissions}
          </div>
        </div>

        <div className="glass dark:glass-dark p-6 rounded-lg border border-teal-200 dark:border-teal-800">
          <div className="text-sm text-teal-600 dark:text-teal-400 mb-1">
            Average Income
          </div>
          <div className="text-3xl font-bold text-teal-700 dark:text-teal-300">
            ${averageIncome > 0 ? averageIncome.toLocaleString() : "---"}
          </div>
          <div className="text-xs text-teal-500 dark:text-teal-500 mt-1">
            /month
          </div>
        </div>

        <div className="glass dark:glass-dark p-6 rounded-lg border border-teal-200 dark:border-teal-800">
          <div className="text-sm text-teal-600 dark:text-teal-400 mb-1">
            Privacy Level
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            100%
          </div>
          <div className="text-xs text-teal-500 dark:text-teal-500 mt-1">
            Fully Encrypted
          </div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="glass dark:glass-dark p-6 rounded-lg border border-teal-200 dark:border-teal-800">
        <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-4">
          Income Distribution
        </h3>
        
        {totalSubmissions === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-teal-600 dark:text-teal-400">
                No submissions yet. Be the first to contribute!
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#5EEAD4" opacity={0.1} />
              <XAxis 
                dataKey="range" 
                stroke="#14B8A6"
                tick={{ fill: "#14B8A6" }}
              />
              <YAxis 
                stroke="#14B8A6"
                tick={{ fill: "#14B8A6" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: "#14B8A6" }}
              />
              <Bar 
                dataKey="count" 
                name="Number of Submissions"
                radius={[8, 8, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Distribution Table */}
      {totalSubmissions > 0 && (
        <div className="glass dark:glass-dark p-6 rounded-lg border border-teal-200 dark:border-teal-800">
          <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-4">
            Detailed Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-teal-200 dark:border-teal-800">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-teal-700 dark:text-teal-300">
                    Income Range
                  </th>
                  <th className="text-right py-2 px-4 text-sm font-semibold text-teal-700 dark:text-teal-300">
                    Count
                  </th>
                  <th className="text-right py-2 px-4 text-sm font-semibold text-teal-700 dark:text-teal-300">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-teal-100 dark:border-teal-900 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-teal-700 dark:text-teal-300">
                      ${row.range}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-teal-700 dark:text-teal-300 font-semibold">
                      {row.count}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-teal-600 dark:text-teal-400">
                      {row.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}





