import React, { FC } from "react";

interface SelectProps {
  id?: string;
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  children: React.ReactNode;
}

const Select: FC<SelectProps> = ({
  id,
  name,
  defaultValue,
  value,
  onChange,
  className = "",
  disabled = false,
  required = false,
  children,
}) => {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${className} ${
        disabled ? "cursor-not-allowed bg-gray-50 text-gray-500" : ""
      }`}
    >
      {children}
    </select>
  );
};

export default Select;
