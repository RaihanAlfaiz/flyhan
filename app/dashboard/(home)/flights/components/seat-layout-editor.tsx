"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Info } from "lucide-react";
import type { TypeSeat } from "@prisma/client";

export type SeatConfig = {
  seatNumber: string;
  type: "ECONOMY" | "BUSINESS" | "FIRST" | "UNAVAILABLE";
};

interface SeatLayoutEditorProps {
  initialSeats?: SeatConfig[];
  onChange: (seats: SeatConfig[]) => void;
}

const SEAT_COLUMNS = ["A", "B", "C", "D"];

export default function SeatLayoutEditor({
  initialSeats,
  onChange,
}: SeatLayoutEditorProps) {
  const [rows, setRows] = useState(10); // Default 10 rows
  const [seatMap, setSeatMap] = useState<
    Record<string, "ECONOMY" | "BUSINESS" | "FIRST" | "UNAVAILABLE">
  >({});

  // Initialize from props
  useEffect(() => {
    if (initialSeats && initialSeats.length > 0) {
      // Find max row to set initial row count
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

      setRows(Math.max(maxRow, 5)); // Min 5 rows
      setSeatMap(initialMap);
    } else {
      // Default: Fill all with Economy
      const defaultMap: typeof seatMap = {};
      for (let r = 1; r <= 10; r++) {
        SEAT_COLUMNS.forEach((col) => {
          defaultMap[`${r}${col}`] = "ECONOMY";
        });
      }
      setSeatMap(defaultMap);
    }
  }, []); // Run once on mount (or when initialSeats changes deeply if we added dep)

  // Notify parent of changes
  useEffect(() => {
    const seats: SeatConfig[] = [];
    for (let r = 1; r <= rows; r++) {
      SEAT_COLUMNS.forEach((col) => {
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
  }, [rows, seatMap, onChange]);

  const handleSeatClick = (seatNum: string) => {
    setSeatMap((prev) => {
      const currentType = prev[seatNum] || "UNAVAILABLE";
      let nextType: typeof currentType;

      // Cycle: ECONOMY -> BUSINESS -> FIRST -> UNAVAILABLE -> ECONOMY
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
        SEAT_COLUMNS.forEach((col) => {
          newMap[`${newRow}${col}`] = "ECONOMY"; // Default new row to Economy
        });
        return newMap;
      });
      return newRow;
    });
  };

  const removeRow = () => {
    if (rows > 1) {
      setRows((prev) => prev - 1);
      // Optional: Cleanup seatMap for removed row, but not strictly necessary as loop limit handles it
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
        return "bg-gray-100 border-gray-200 text-transparent hover:bg-gray-200"; // Ghost seat
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-500 border border-emerald-600"></div>
          <span className="text-sm font-medium">Economy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-purple-500 border border-purple-600"></div>
          <span className="text-sm font-medium">Business</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-500 border border-amber-600"></div>
          <span className="text-sm font-medium">First Class</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gray-100 border border-gray-200"></div>
          <span className="text-sm text-gray-500">Kosong (Gap)</span>
        </div>
        <div className="ml-auto text-xs text-gray-400 flex items-center gap-1">
          <Info className="h-4 w-4" />
          Klik kursi untuk ubah tipe
        </div>
      </div>

      {/* Editor Surface */}
      <div className="relative bg-white rounded-3xl border-2 border-gray-200 p-8 min-h-[500px] flex flex-col items-center shadow-inner overflow-hidden">
        {/* Plane Nose Visual Hint */}
        <div className="absolute top-0 w-32 h-16 bg-gradient-to-b from-gray-100 to-white rounded-b-full border-b border-r border-l border-gray-200 mb-8 z-0" />

        {/* Seat Grid */}
        <div className="z-10 flex flex-col gap-3 w-fit mx-auto mt-12 mb-8">
          <div className="flex justify-between w-full px-4 mb-2 text-gray-400 font-mono text-sm">
            <span>A</span>
            <span>B</span>
            <span className="w-8"></span> {/* Aisle */}
            <span>C</span>
            <span>D</span>
          </div>

          {[...Array(rows)].map((_, i) => {
            const rowNum = i + 1;
            return (
              <div key={rowNum} className="flex items-center gap-4">
                {/* Row Number */}
                <div className="w-6 text-right font-mono text-xs text-gray-400 absolute left-8 mt-3">
                  {rowNum}
                </div>

                {/* Left Side (A, B) */}
                <div className="flex gap-2">
                  {["A", "B"].map((col) => {
                    const seatNum = `${rowNum}${col}`;
                    const type = seatMap[seatNum] || "UNAVAILABLE";
                    return (
                      <button
                        key={seatNum}
                        type="button"
                        onClick={() => handleSeatClick(seatNum)}
                        className={`w-10 h-10 rounded-lg border-b-4 transition-all duration-100 active:border-b-0 active:translate-y-1 flex items-center justify-center font-bold text-xs ${getSeatColor(
                          type
                        )}`}
                      >
                        {type !== "UNAVAILABLE" && seatNum}
                      </button>
                    );
                  })}
                </div>

                {/* Aisle */}
                <div className="w-8 text-center text-xs text-gray-200 font-mono select-none">
                  {rowNum}
                </div>

                {/* Right Side (C, D) */}
                <div className="flex gap-2">
                  {["C", "D"].map((col) => {
                    const seatNum = `${rowNum}${col}`;
                    const type = seatMap[seatNum] || "UNAVAILABLE";
                    return (
                      <button
                        key={seatNum}
                        type="button"
                        onClick={() => handleSeatClick(seatNum)}
                        className={`w-10 h-10 rounded-lg border-b-4 transition-all duration-100 active:border-b-0 active:translate-y-1 flex items-center justify-center font-bold text-xs ${getSeatColor(
                          type
                        )}`}
                      >
                        {type !== "UNAVAILABLE" && seatNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="bottom-8 flex gap-4 sticky">
          <Button
            type="button"
            variant="outline"
            onClick={removeRow}
            disabled={rows <= 1}
            className="rounded-full shadow-lg border-red-200 text-red-600 hover:bg-red-50"
          >
            <Minus className="w-4 h-4 mr-2" /> Kurangi Baris
          </Button>
          <Button
            type="button"
            onClick={addRow}
            className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah Baris
          </Button>
        </div>
      </div>
    </div>
  );
}
