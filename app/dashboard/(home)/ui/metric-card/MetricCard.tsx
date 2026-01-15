import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  change?: {
    value: string;
    type: "increase" | "decrease";
  };
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = "bg-gray-100 dark:bg-gray-800",
  change,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-xl ${iconBgColor}`}
      >
        {icon}
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            {value}
          </h4>
        </div>
        {change && (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              change.type === "increase"
                ? "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500"
                : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500"
            }`}
          >
            {change.type === "increase" ? "↑" : "↓"} {change.value}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
