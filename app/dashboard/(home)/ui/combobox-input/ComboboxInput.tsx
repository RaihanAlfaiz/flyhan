"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, Plus } from "lucide-react";

export interface ComboboxOption {
  value: string;
  label: string;
  code?: string;
}

interface ComboboxInputProps {
  name: string;
  codeName?: string;
  options: ComboboxOption[];
  defaultValue?: string;
  defaultCode?: string;
  placeholder?: string;
  codePlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  onValueChange?: (value: string, code: string) => void;
}

export default function ComboboxInput({
  name,
  codeName,
  options,
  defaultValue = "",
  defaultCode = "",
  placeholder = "Search or type new...",
  codePlaceholder = "Code",
  disabled = false,
  required = false,
  className = "",
  onValueChange,
}: ComboboxInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(defaultValue);
  const [codeValue, setCodeValue] = useState(defaultCode);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update when props change
  useEffect(() => {
    setSearchQuery(defaultValue);
    setCodeValue(defaultCode);
  }, [defaultValue, defaultCode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if current value is new (not in options)
  const isNewValue =
    searchQuery &&
    !options.some(
      (opt) => opt.label.toLowerCase() === searchQuery.toLowerCase()
    );

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        setIsOpen(false);
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (option: ComboboxOption) => {
    setSearchQuery(option.label);
    setCodeValue(option.code || "");
    onValueChange?.(option.label, option.code || "");
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value.toUpperCase();
    setCodeValue(newCode);
    onValueChange?.(searchQuery, newCode);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex gap-2">
        {/* City Name Input */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            name={name}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            className={`
              w-full h-11 px-4 pr-10 rounded-lg border text-left transition-all
              ${
                disabled
                  ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400 dark:bg-gray-800 dark:border-gray-700"
                  : isOpen
                  ? "border-brand-500 ring-3 ring-brand-500/20 bg-white dark:bg-gray-900"
                  : "border-gray-300 hover:border-gray-400 bg-white dark:bg-gray-900 dark:border-gray-700 dark:hover:border-gray-600"
              }
              text-gray-800 dark:text-white/90
            `}
          />
          <ChevronDown
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* City Code Input */}
        {codeName && (
          <input
            type="text"
            name={codeName}
            value={codeValue}
            onChange={handleCodeChange}
            disabled={disabled}
            required={required}
            placeholder={codePlaceholder}
            maxLength={3}
            className={`
              w-20 h-11 px-3 rounded-lg border text-center uppercase font-semibold transition-all
              ${
                disabled
                  ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400 dark:bg-gray-800 dark:border-gray-700"
                  : "border-gray-300 hover:border-gray-400 bg-white dark:bg-gray-900 dark:border-gray-700 dark:hover:border-gray-600"
              }
              text-gray-800 dark:text-white/90
            `}
          />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 overflow-hidden dark:bg-gray-900 dark:border-gray-700">
          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 && !isNewValue && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No cities found. Type to add new.
              </div>
            )}

            {/* Show "Add new" option if typing new value */}
            {isNewValue && (
              <div className="px-4 py-3 flex items-center gap-2 text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 border-b border-gray-100 dark:border-gray-800">
                <Plus className="w-4 h-4" />
                <span className="text-sm">
                  Add &quot;<span className="font-semibold">{searchQuery}</span>
                  &quot; as new city
                </span>
              </div>
            )}

            {filteredOptions.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`
                  w-full px-4 py-2.5 text-left flex items-center justify-between gap-2 transition-colors
                  ${
                    highlightedIndex === index
                      ? "bg-gray-50 dark:bg-gray-800"
                      : ""
                  }
                  ${
                    searchQuery.toLowerCase() === option.label.toLowerCase()
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-gray-700 dark:text-gray-300"
                  }
                `}
              >
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <div className="font-medium truncate">{option.label}</div>
                  {option.code && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-mono">
                      {option.code}
                    </span>
                  )}
                </div>
                {searchQuery.toLowerCase() === option.label.toLowerCase() && (
                  <Check className="w-4 h-4 text-brand-500 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
