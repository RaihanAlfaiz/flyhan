"use client";

import { useState } from "react";
import { updateSetting } from "../lib/actions";
import {
  showSuccess,
  showError,
  showLoading,
  closeLoading,
} from "@/lib/sweetalert";
import { Save, RefreshCw } from "lucide-react";

interface SettingsFormProps {
  settingKey: string;
  label: string;
  description?: string;
  currentValue: string;
  type?: "text" | "number";
  suffix?: string;
  min?: number;
  max?: number;
}

export default function SettingsForm({
  settingKey,
  label,
  description,
  currentValue,
  type = "text",
  suffix,
  min,
  max,
}: SettingsFormProps) {
  const [value, setValue] = useState(currentValue);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === "number" && min !== undefined && max !== undefined) {
      const numValue = parseInt(value);
      if (numValue < min || numValue > max) {
        showError("Invalid Value", `Value must be between ${min} and ${max}`);
        return;
      }
    }

    setLoading(true);
    showLoading("Saving...");

    const result = await updateSetting(settingKey, value, description);

    closeLoading();
    setLoading(false);

    if (result.successTitle) {
      showSuccess(result.successTitle, result.successDesc || undefined);
    } else if (result.errorTitle) {
      showError(result.errorTitle, result.errorDesc || undefined);
    }
  };

  const hasChanged = value !== currentValue;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
        <div className="relative">
          <input
            type={type}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            min={min}
            max={max}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
          />
          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
              {suffix}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !hasChanged}
        className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold transition-all ${
          hasChanged
            ? "bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20"
            : "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
        }`}
      >
        {loading ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <Save className="w-5 h-5" />
        )}
        {loading ? "Saving..." : hasChanged ? "Save Changes" : "No Changes"}
      </button>
    </form>
  );
}
