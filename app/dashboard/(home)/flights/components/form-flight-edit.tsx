"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useActionState, useEffect, useState, type FC } from "react";
import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import { updateFlight } from "../lib/actions";
import { getFlightById } from "../lib/data";
import { useFormStatus } from "react-dom";
import type { Flight, Airplane, FlightSeat } from "@prisma/client";
import { Loader2 } from "lucide-react";
import SeatLayoutEditor, { type SeatConfig } from "./seat-layout-editor";

interface AirplaneSelect {
  id: string;
  name: string;
  code: string;
}

interface FlightWithRelations extends Flight {
  plane: Airplane;
  seats: FlightSeat[];
}

interface FormFlightEditProps {
  id: string;
  airplanes: AirplaneSelect[];
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
      {pending ? "Updating..." : "Update Flight"}
    </button>
  );
};

function formatDateForInput(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const FormFlightEdit: FC<FormFlightEditProps> = ({ id, airplanes }) => {
  const [flight, setFlight] = useState<FlightWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [seatConfig, setSeatConfig] = useState<string>("[]");
  const [initialSeats, setInitialSeats] = useState<SeatConfig[]>([]);

  const updateFlightWithId = updateFlight.bind(null, id);
  const [state, formAction] = useActionState(
    updateFlightWithId,
    initialFormState
  );

  useEffect(() => {
    const fetchFlight = async () => {
      const data = await getFlightById(id);
      setFlight(data as FlightWithRelations);

      if (data && data.seats) {
        const mappedSeats = data.seats.map((s: FlightSeat) => ({
          seatNumber: s.seatNumber,
          type: s.type as "ECONOMY" | "BUSINESS" | "FIRST" | "UNAVAILABLE",
        }));
        setInitialSeats(mappedSeats);
        setSeatConfig(JSON.stringify(mappedSeats));
      }

      setLoading(false);
    };
    fetchFlight();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[#4e73df]" />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Flight not found</p>
      </div>
    );
  }

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
          defaultValue={flight.planeId}
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
              defaultValue={(flight as any).priceEconomy || flight.price}
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
              defaultValue={
                (flight as any).priceBusiness ||
                Math.round(Number(flight.price) * 1.5)
              }
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
              defaultValue={
                (flight as any).priceFirst ||
                Math.round(Number(flight.price) * 2.5)
              }
              required
              className="h-10 rounded border-gray-300 focus:border-[#4e73df] focus:ring-[#4e73df]"
            />
          </div>
        </div>
      </div>

      {/* Seat Layout */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-bold text-gray-700 mb-3">Seat Layout</h4>
        <div className="p-3 bg-[#f6c23e]/10 border border-[#f6c23e]/20 rounded text-sm text-[#b58d0c] mb-3">
          <strong>Warning:</strong> Changing the seat layout on a flight with
          existing bookings may cause data inconsistency.
        </div>
        <SeatLayoutEditor
          initialSeats={initialSeats}
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
              defaultValue={flight.departureCity}
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
              maxLength={5}
              defaultValue={flight.departureCityCode}
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
              defaultValue={formatDateForInput(flight.departureDate)}
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
              defaultValue={flight.destinationCity}
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
              maxLength={5}
              defaultValue={flight.destinationCityCode}
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
              defaultValue={formatDateForInput(flight.arrivalDate)}
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

export default FormFlightEdit;
