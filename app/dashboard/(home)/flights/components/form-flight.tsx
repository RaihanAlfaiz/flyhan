"use client";

import React, { useActionState, type FC } from "react";
import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import { saveFlight } from "../lib/actions";
import { useFormStatus } from "react-dom";
import SeatLayoutEditor from "./seat-layout-editor";
import Input from "../../ui/input/Input";
import Label from "../../ui/label/Label";
import Button from "../../ui/button/Button";
import SearchableSelect from "../../ui/searchable-select/SearchableSelect";
import ComboboxInput from "../../ui/combobox-input/ComboboxInput";

interface Airplane {
  id: string;
  name: string;
  code: string;
}

interface City {
  name: string;
  code: string;
}

interface FormFlightProps {
  airplanes: Airplane[];
  existingCities?: City[];
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
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Flight"}
    </Button>
  );
};

const FormFlight: FC<FormFlightProps> = ({
  airplanes,
  existingCities = [],
}) => {
  const [state, formAction] = useActionState(saveFlight, initialFormState);
  const [seatConfig, setSeatConfig] = React.useState<string>("[]");

  const airplaneOptions = airplanes.map((plane) => ({
    value: plane.id,
    label: plane.name,
    description: plane.code,
  }));

  const cityOptions = existingCities.map((city) => ({
    value: city.name,
    label: city.name,
    code: city.code,
  }));

  return (
    <form action={formAction} className="space-y-6">
      {state.errorTitle && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
          <strong>{state.errorTitle}</strong>
          {state.errorDesc && <p className="mt-1">{state.errorDesc}</p>}
        </div>
      )}

      {/* Airplane Selection */}
      <div>
        <Label htmlFor="planeId" required>
          Select Airplane
        </Label>
        <SearchableSelect
          name="planeId"
          options={airplaneOptions}
          placeholder="Search and select airplane..."
          required
        />
      </div>

      {/* Prices */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-5">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-4">
          Ticket Prices
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="priceEconomy" required>
              Economy (IDR)
            </Label>
            <Input
              id="priceEconomy"
              name="priceEconomy"
              type="number"
              placeholder="500000"
              required
            />
          </div>
          <div>
            <Label htmlFor="priceBusiness" required>
              Business (IDR)
            </Label>
            <Input
              id="priceBusiness"
              name="priceBusiness"
              type="number"
              placeholder="1500000"
              required
            />
          </div>
          <div>
            <Label htmlFor="priceFirst" required>
              First Class (IDR)
            </Label>
            <Input
              id="priceFirst"
              name="priceFirst"
              type="number"
              placeholder="3000000"
              required
            />
          </div>
        </div>
      </div>

      {/* Seat Layout */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-5">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-4">
          Seat Layout
        </h4>
        <SeatLayoutEditor
          onChange={(seats) => setSeatConfig(JSON.stringify(seats))}
        />
        <input type="hidden" name="seatConfig" value={seatConfig} />
      </div>

      {/* Departure */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-5">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-4">
          Departure
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="departureCity" required>
              City & Code
            </Label>
            <ComboboxInput
              name="departureCity"
              codeName="departureCityCode"
              options={cityOptions}
              placeholder="Search or type city name..."
              codePlaceholder="JKT"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Select existing city or type new one
            </p>
          </div>
          <div>
            <Label htmlFor="departureDate" required>
              Date & Time
            </Label>
            <Input
              id="departureDate"
              name="departureDate"
              type="datetime-local"
              required
            />
          </div>
        </div>
      </div>

      {/* Arrival */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-5">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-4">
          Arrival
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="destinationCity" required>
              City & Code
            </Label>
            <ComboboxInput
              name="destinationCity"
              codeName="destinationCityCode"
              options={cityOptions}
              placeholder="Search or type city name..."
              codePlaceholder="DPS"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Select existing city or type new one
            </p>
          </div>
          <div>
            <Label htmlFor="arrivalDate" required>
              Date & Time
            </Label>
            <Input
              id="arrivalDate"
              name="arrivalDate"
              type="datetime-local"
              required
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
