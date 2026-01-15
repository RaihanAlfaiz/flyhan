"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveFlashSale, getActiveFlights } from "../lib/actions";
import Input from "../../ui/input/Input";
import Label from "../../ui/label/Label";
import Button from "../../ui/button/Button";
import { Flight, Airplane } from "@prisma/client";
import { Loader2 } from "lucide-react";

type FlightWithPlane = Flight & { plane: Airplane };

interface ActionResult {
  successTitle?: string | null;
  successDesc?: string | null;
  errorTitle?: string | null;
  errorDesc?: string | null;
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
      {pending ? "Creating..." : "Create Flash Sale"}
    </Button>
  );
};

export default function FormFlashSale() {
  const [flights, setFlights] = useState<FlightWithPlane[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, formAction] = useActionState(saveFlashSale, initialFormState);

  useEffect(() => {
    const fetchFlights = async () => {
      const data = await getActiveFlights();
      setFlights(data);
      setLoading(false);
    };
    fetchFlights();
  }, []);

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <form action={formAction} className="space-y-5">
      {state.errorTitle && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
          <strong>{state.errorTitle}</strong>
          {state.errorDesc && <p className="mt-1">{state.errorDesc}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="title" required>
            Flash Sale Title
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g. Weekend Getaway Deal"
            required
          />
        </div>

        <div>
          <Label htmlFor="discountPercent" required>
            Discount Percentage
          </Label>
          <Input
            id="discountPercent"
            name="discountPercent"
            type="number"
            placeholder="e.g. 50"
            min="1"
            max="90"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter 1-90 for percentage off
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="flightId" required>
          Select Flight
        </Label>
        {loading ? (
          <div className="flex items-center gap-2 py-4 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading flights...
          </div>
        ) : (
          <select
            id="flightId"
            name="flightId"
            required
            className="w-full h-11 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="">-- Select a flight --</option>
            {flights.map((flight) => (
              <option key={flight.id} value={flight.id}>
                {flight.departureCity} → {flight.destinationCity} |{" "}
                {formatDate(flight.departureDate)} | {flight.plane.code} |{" "}
                {formatCurrency(flight.price)}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          placeholder="Brief description of the flash sale..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <Label htmlFor="startDate" required>
            Start Date & Time
          </Label>
          <Input
            id="startDate"
            name="startDate"
            type="datetime-local"
            required
          />
        </div>

        <div>
          <Label htmlFor="endDate" required>
            End Date & Time
          </Label>
          <Input id="endDate" name="endDate" type="datetime-local" required />
        </div>

        <div>
          <Label htmlFor="maxQuota" required>
            Max Quota (Tickets)
          </Label>
          <Input
            id="maxQuota"
            name="maxQuota"
            type="number"
            placeholder="e.g. 10"
            min="1"
            defaultValue="10"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image">Banner Image (Optional)</Label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-500 hover:file:bg-brand-100 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
        <p className="text-xs text-gray-500 mt-1">Recommended: 800x400px</p>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
