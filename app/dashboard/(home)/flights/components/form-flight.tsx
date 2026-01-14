"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useActionState, type FC } from "react";
import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import { saveFlight } from "../lib/actions";
import { useFormStatus } from "react-dom";
import SeatLayoutEditor from "./seat-layout-editor";

interface Airplane {
  id: string;
  name: string;
  code: string;
}

interface FormFlightProps {
  airplanes: Airplane[];
}

const initialFormState: ActionResult = {
  errorTitle: null,
  errorDesc: null,
  successTitle: null,
  successDesc: null,
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      type="submit"
      className="px-4 py-2 bg-[#4e73df] hover:bg-[#2e59d9] text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save Flight"}
    </button>
  );
};

const FormFlight: FC<FormFlightProps> = ({ airplanes }) => {
  const [state, formAction] = useActionState(saveFlight, initialFormState);
  const [seatConfig, setSeatConfig] = React.useState<string>("[]");

  return (
    <form action={formAction} className="space-y-6">
      {state.errorTitle && (
        <div className="p-3 bg-[#e74a3b]/10 border border-[#e74a3b]/20 text-[#e74a3b] rounded text-sm">
          <strong>{state.errorTitle}</strong>
          {state.errorDesc && <p className="mt-1">{state.errorDesc}</p>}
        </div>
      )}

      {/* Airplane Selection */}
      <div className="space-y-1">
        <Label htmlFor="planeId" className="text-sm font-medium text-gray-700">
          Select Airplane
        </Label>
        <select
          id="planeId"
          name="planeId"
          required
          className="flex h-10 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#4e73df] focus:outline-none focus:ring-1 focus:ring-[#4e73df]"
        >
          <option value="">-- Select Airplane --</option>
          {airplanes.map((plane) => (
            <option key={plane.id} value={plane.id}>
              {plane.name} ({plane.code})
            </option>
          ))}
        </select>
      </div>

      {/* Prices */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-bold text-gray-700 mb-3">Ticket Prices</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label
              htmlFor="priceEconomy"
              className="text-sm font-medium text-gray-700"
            >
              Economy (IDR)
            </Label>
            <Input
              id="priceEconomy"
              name="priceEconomy"
              type="number"
              placeholder="500000"
              required
              className="h-10 rounded border-gray-300 focus:border-[#4e73df] focus:ring-[#4e73df]"
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="priceBusiness"
              className="text-sm font-medium text-gray-700"
            >
              Business (IDR)
            </Label>
            <Input
              id="priceBusiness"
              name="priceBusiness"
              type="number"
              placeholder="1500000"
              required
              className="h-10 rounded border-gray-300 focus:border-[#4e73df] focus:ring-[#4e73df]"
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="priceFirst"
              className="text-sm font-medium text-gray-700"
            >
              First Class (IDR)
            </Label>
            <Input
              id="priceFirst"
              name="priceFirst"
              type="number"
              placeholder="3000000"
              required
              className="h-10 rounded border-gray-300 focus:border-[#4e73df] focus:ring-[#4e73df]"
            />
          </div>
        </div>
      </div>

      {/* Seat Layout */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-bold text-gray-700 mb-3">Seat Layout</h4>
        <SeatLayoutEditor
          onChange={(seats) => setSeatConfig(JSON.stringify(seats))}
        />
        <input type="hidden" name="seatConfig" value={seatConfig} />
      </div>

      {/* Departure */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-bold text-gray-700 mb-3">Departure</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label
              htmlFor="departureCity"
              className="text-sm font-medium text-gray-700"
            >
              City
            </Label>
            <Input
              id="departureCity"
              name="departureCity"
              placeholder="Jakarta"
              required
              className="h-10 rounded border-gray-300 focus:border-[#4e73df] focus:ring-[#4e73df]"
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="departureCityCode"
              className="text-sm font-medium text-gray-700"
            >
              City Code
            </Label>
            <Input
              id="departureCityCode"
              name="departureCityCode"
              placeholder="JKT"
              maxLength={5}
              required
              className="h-10 rounded border-gray-300 focus:border-[#4e73df] focus:ring-[#4e73df] uppercase"
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="departureDate"
              className="text-sm font-medium text-gray-700"
            >
              Date & Time
            </Label>
            <Input
              id="departureDate"
              name="departureDate"
              type="datetime-local"
              required
              className="h-10 rounded border-gray-300 focus:border-[#4e73df] focus:ring-[#4e73df]"
            />
          </div>
        </div>
      </div>

      {/* Arrival */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-bold text-gray-700 mb-3">Arrival</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label
              htmlFor="destinationCity"
              className="text-sm font-medium text-gray-700"
            >
              City
            </Label>
            <Input
              id="destinationCity"
              name="destinationCity"
              placeholder="Bali"
              required
              className="h-10 rounded border-gray-300 focus:border-[#4e73df] focus:ring-[#4e73df]"
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="destinationCityCode"
              className="text-sm font-medium text-gray-700"
            >
              City Code
            </Label>
            <Input
              id="destinationCityCode"
              name="destinationCityCode"
              placeholder="DPS"
              maxLength={5}
              required
              className="h-10 rounded border-gray-300 focus:border-[#4e73df] focus:ring-[#4e73df] uppercase"
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="arrivalDate"
              className="text-sm font-medium text-gray-700"
            >
              Date & Time
            </Label>
            <Input
              id="arrivalDate"
              name="arrivalDate"
              type="datetime-local"
              required
              className="h-10 rounded border-gray-300 focus:border-[#4e73df] focus:ring-[#4e73df]"
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
};

export default FormFlight;
