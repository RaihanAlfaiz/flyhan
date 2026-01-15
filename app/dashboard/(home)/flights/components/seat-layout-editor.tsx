"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Info, Wand2, RotateCcw } from "lucide-react";

export type SeatConfig = {
  seatNumber: string;
  type: "ECONOMY" | "BUSINESS" | "FIRST" | "UNAVAILABLE";
};

interface SeatLayoutEditorProps {
  initialSeats?: SeatConfig[];
  onChange: (seats: SeatConfig[]) => void;
}

// Predefined layouts
const LAYOUTS = {
  "2-2": { label: "Small (2-2)", columns: ["A", "B", "-", "C", "D"] },
  "3-3": {
    label: "Medium (3-3)",
    columns: ["A", "B", "C", "-", "D", "E", "F"],
  },
  "2-4-2": {
    label: "Wide (2-4-2)",
    columns: ["A", "B", "-", "C", "D", "E", "F", "-", "G", "H"],
  },
  "3-4-3": {
    label: "Jumbo (3-4-3)",
    columns: ["A", "B", "C", "-", "D", "E", "F", "G", "-", "H", "J", "K"],
  },
};

type LayoutKey = keyof typeof LAYOUTS;

export default function SeatLayoutEditor({
  initialSeats,
  onChange,
}: SeatLayoutEditorProps) {
  const [layoutKey, setLayoutKey] = useState<LayoutKey>("3-3");
  const [rows, setRows] = useState(20);
  const [seatMap, setSeatMap] = useState<
    Record<string, "ECONOMY" | "BUSINESS" | "FIRST" | "UNAVAILABLE">
  >({});

  // Quick zone config
  const [firstClassRows, setFirstClassRows] = useState(2);
  const [businessRows, setBusinessRows] = useState(4);

  const layout = LAYOUTS[layoutKey];
  const seatColumns = layout.columns.filter((c) => c !== "-");

  // Generate seats based on layout and zones
  const generateSeats = useCallback(() => {
    const newMap: typeof seatMap = {};

    for (let r = 1; r <= rows; r++) {
      let rowType: "FIRST" | "BUSINESS" | "ECONOMY" = "ECONOMY";

      if (r <= firstClassRows) {
        rowType = "FIRST";
      } else if (r <= firstClassRows + businessRows) {
        rowType = "BUSINESS";
      }

      seatColumns.forEach((col) => {
        newMap[`${r}${col}`] = rowType;
      });
    }

    setSeatMap(newMap);
  }, [rows, firstClassRows, businessRows, seatColumns]);

  // Initialize on mount
  useEffect(() => {
    if (initialSeats && initialSeats.length > 0) {
      let maxRow = 0;
      const initialMap: typeof seatMap = {};

      initialSeats.forEach((seat) => {
        const rowMatch = seat.seatNumber.match(/^(\d+)/);
        if (rowMatch) {
          const row = parseInt(rowMatch[1]);
          if (row > maxRow) maxRow = row;
        }
        initialMap[seat.seatNumber] = seat.type as any;
      });

      setRows(Math.max(maxRow, 10));
      setSeatMap(initialMap);
    } else {
      generateSeats();
    }
  }, []);

  // Notify parent of changes
  useEffect(() => {
    const seats: SeatConfig[] = [];
    for (let r = 1; r <= rows; r++) {
      seatColumns.forEach((col) => {
        const seatNum = `${r}${col}`;
        const type = seatMap[seatNum] || "UNAVAILABLE";
        if (type !== "UNAVAILABLE") {
          seats.push({
            seatNumber: seatNum,
            type: type,
          });
        }
      });
    }
    onChange(seats);
  }, [rows, seatMap, seatColumns, onChange]);

  const handleSeatClick = (seatNum: string) => {
    setSeatMap((prev) => {
      const currentType = prev[seatNum] || "UNAVAILABLE";
      let nextType: typeof currentType;

      switch (currentType) {
        case "ECONOMY":
          nextType = "BUSINESS";
          break;
        case "BUSINESS":
          nextType = "FIRST";
          break;
        case "FIRST":
          nextType = "UNAVAILABLE";
          break;
        case "UNAVAILABLE":
          nextType = "ECONOMY";
          break;
        default:
          nextType = "ECONOMY";
      }

      return { ...prev, [seatNum]: nextType };
    });
  };

  const addRow = () => {
    setRows((prev) => {
      const newRow = prev + 1;
      setSeatMap((prevMap) => {
        const newMap = { ...prevMap };
        seatColumns.forEach((col) => {
          newMap[`${newRow}${col}`] = "ECONOMY";
        });
        return newMap;
      });
      return newRow;
    });
  };

  const removeRow = () => {
    if (rows > 1) {
      setRows((prev) => prev - 1);
    }
  };

  const getSeatColor = (type: string) => {
    switch (type) {
      case "ECONOMY":
        return "bg-emerald-500 border-emerald-600 hover:bg-emerald-600 text-white";
      case "BUSINESS":
        return "bg-purple-500 border-purple-600 hover:bg-purple-600 text-white";
      case "FIRST":
        return "bg-amber-500 border-amber-600 hover:bg-amber-600 text-white";
      case "UNAVAILABLE":
        return "bg-gray-100 border-gray-200 text-transparent hover:bg-gray-200";
      default:
        return "bg-gray-300";
    }
  };

  // Count seats
  const seatCounts = {
    first: Object.values(seatMap).filter((t) => t === "FIRST").length,
    business: Object.values(seatMap).filter((t) => t === "BUSINESS").length,
    economy: Object.values(seatMap).filter((t) => t === "ECONOMY").length,
  };
  const totalSeats =
    seatCounts.first + seatCounts.business + seatCounts.economy;

  return (
    <div className="w-full space-y-6">
      {/* Quick Generator Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
        <h5 className="font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Quick Seat Generator
        </h5>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Layout Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cabin Layout
            </label>
            <select
              value={layoutKey}
              onChange={(e) => setLayoutKey(e.target.value as LayoutKey)}
              className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm"
            >
              {Object.entries(LAYOUTS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          {/* Total Rows */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Rows
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={rows}
              onChange={(e) =>
                setRows(
                  Math.min(60, Math.max(1, parseInt(e.target.value) || 1))
                )
              }
              className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm"
            />
          </div>

          {/* First Class Rows */}
          <div>
            <label className="block text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">
              First Class (Rows)
            </label>
            <input
              type="number"
              min={0}
              max={rows}
              value={firstClassRows}
              onChange={(e) =>
                setFirstClassRows(
                  Math.min(rows, Math.max(0, parseInt(e.target.value) || 0))
                )
              }
              className="w-full h-10 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 px-3 text-sm"
            />
          </div>

          {/* Business Rows */}
          <div>
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-400 mb-1">
              Business (Rows)
            </label>
            <input
              type="number"
              min={0}
              max={rows - firstClassRows}
              value={businessRows}
              onChange={(e) =>
                setBusinessRows(
                  Math.min(
                    rows - firstClassRows,
                    Math.max(0, parseInt(e.target.value) || 0)
                  )
                )
              }
              className="w-full h-10 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30 px-3 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={generateSeats}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Seats
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSeatMap({})}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Seat Summary + Row Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-500 border border-amber-600"></div>
            <span className="text-sm font-medium">
              First: {seatCounts.first}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-purple-500 border border-purple-600"></div>
            <span className="text-sm font-medium">
              Business: {seatCounts.business}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500 border border-emerald-600"></div>
            <span className="text-sm font-medium">
              Economy: {seatCounts.economy}
            </span>
          </div>
        </div>

        {/* Row Controls */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Rows: {rows}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeRow}
            disabled={rows <= 1}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={addRow}
            disabled={rows >= 60}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <span className="text-sm font-bold text-gray-900 dark:text-white ml-2">
            Total: {totalSeats} seats
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Info className="h-4 w-4" />
        Click any seat to change its type
      </div>

      {/* Editor Surface */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-700 p-8 min-h-[400px] flex flex-col items-center shadow-inner overflow-auto max-h-[600px]">
        {/* Plane Nose */}
        <div className="absolute top-0 w-32 h-12 bg-gradient-to-b from-gray-100 dark:from-gray-800 to-transparent rounded-b-full z-0" />

        {/* Seat Grid */}
        <div className="z-10 flex flex-col gap-2 w-fit mx-auto mt-8 mb-8">
          {/* Column Headers */}
          <div className="flex justify-center gap-2 mb-2">
            {layout.columns.map((col, idx) =>
              col === "-" ? (
                <div key={idx} className="w-6" />
              ) : (
                <div
                  key={idx}
                  className="w-9 text-center text-gray-400 font-mono text-xs"
                >
                  {col}
                </div>
              )
            )}
          </div>

          {/* Rows */}
          {[...Array(rows)].map((_, i) => {
            const rowNum = i + 1;
            return (
              <div key={rowNum} className="flex items-center gap-2">
                {/* Row Number */}
                <div className="w-6 text-right font-mono text-xs text-gray-400 mr-2">
                  {rowNum}
                </div>

                {/* Seats */}
                {layout.columns.map((col, idx) =>
                  col === "-" ? (
                    <div key={idx} className="w-6" /> // Aisle
                  ) : (
                    <button
                      key={`${rowNum}${col}`}
                      type="button"
                      onClick={() => handleSeatClick(`${rowNum}${col}`)}
                      className={`w-9 h-9 rounded-lg border-b-[3px] transition-all duration-100 active:border-b-0 active:translate-y-0.5 flex items-center justify-center font-bold text-[10px] ${getSeatColor(
                        seatMap[`${rowNum}${col}`] || "UNAVAILABLE"
                      )}`}
                    >
                      {seatMap[`${rowNum}${col}`] &&
                        seatMap[`${rowNum}${col}`] !== "UNAVAILABLE" &&
                        `${rowNum}${col}`}
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
