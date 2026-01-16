"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQAccordion({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-flysha-bg-purple rounded-[20px] overflow-hidden border border-white/5 transition-all hover:border-flysha-light-purple/30"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <span
              className={`font-bold text-lg ${
                openIndex === index ? "text-flysha-light-purple" : "text-white"
              }`}
            >
              {item.q}
            </span>
            {openIndex === index ? (
              <ChevronUp className="text-flysha-light-purple" />
            ) : (
              <ChevronDown className="text-gray-500" />
            )}
          </button>
          <div
            className={`transition-all duration-300 ease-in-out grid ${
              openIndex === index
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-6 pb-6 text-gray-300 leading-relaxed border-t border-white/5 pt-4">
                {item.a}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
