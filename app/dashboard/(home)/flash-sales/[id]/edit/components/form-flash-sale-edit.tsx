"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateFlashSale,
  getActiveFlights,
  getFlashSaleById,
} from "../../../lib/actions";
import Input from "../../../../ui/input/Input";
import Label from "../../../../ui/label/Label";
import Button from "../../../../ui/button/Button";
import { Flight, Airplane } from "@prisma/client";
import { Loader2 } from "lucide-react";

type FlightWithPlane = Flight & { plane: Airplane };
type FlashSaleWithFlight = FlashSale & { flight: FlightWithPlane };

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
      {pending ? "Updating..." : "Update Flash Sale"}
    </Button>
  );
};

interface FormFlashSaleEditProps {
  id: string;
}

export default function FormFlashSaleEdit({ id }: FormFlashSaleEditProps) {
  const [flashSale, setFlashSale] = useState<FlashSaleWithFlight | null>(null);
  const [flights, setFlights] = useState<FlightWithPlane[]>([]);
  const [loading, setLoading] = useState(true);

  const updateFlashSaleWithId = updateFlashSale.bind(null, id);
  const [state, formAction] = useActionState(
    updateFlashSaleWithId,
    initialFormState
  );

  useEffect(() => {
    const fetchData = async () => {
      const [saleData, flightsData] = await Promise.all([
        getFlashSaleById(id),
        getActiveFlights(),
      ]);
      setFlashSale(saleData);
      setFlights(flightsData);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!flashSale) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Flash sale not found</p>
      </div>
    );
  }

  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

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
            defaultValue={flashSale.title}
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
            defaultValue={flashSale.discountPercent}
            min="1"
            max="90"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="flightId" required>
          Select Flight
        </Label>
        <select
          id="flightId"
          name="flightId"
          defaultValue={flashSale.flightId}
          required
          className="w-full h-11 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value={flashSale.flightId}>
            {flashSale.flight.departureCity} →{" "}
            {flashSale.flight.destinationCity} (Current)
          </option>
          {flights
            .filter((f) => f.id !== flashSale.flightId)
            .map((flight) => (
              <option key={flight.id} value={flight.id}>
                {flight.departureCity} → {flight.destinationCity} |{" "}
                {formatDate(flight.departureDate)} |{" "}
                {formatCurrency(flight.price)}
              </option>
            ))}
        </select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={flashSale.description || ""}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
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
            defaultValue={formatDateForInput(flashSale.startDate)}
            required
          />
        </div>

        <div>
          <Label htmlFor="endDate" required>
            End Date & Time
          </Label>
          <Input
            id="endDate"
            name="endDate"
            type="datetime-local"
            defaultValue={formatDateForInput(flashSale.endDate)}
            required
          />
        </div>

        <div>
          <Label htmlFor="maxQuota" required>
            Max Quota
          </Label>
          <Input
            id="maxQuota"
            name="maxQuota"
            type="number"
            defaultValue={flashSale.maxQuota}
            min="1"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Sold: {flashSale.soldCount}/{flashSale.maxQuota}
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="isActive">Status</Label>
        <select
          id="isActive"
          name="isActive"
          defaultValue={flashSale.isActive ? "true" : "false"}
          className="w-full h-11 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div>
        <Label htmlFor="image">Banner Image</Label>
        {flashSale.image && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <p className="text-xs text-gray-500 mb-2">Current image:</p>
            <img
              src={flashSale.image}
              alt={flashSale.title}
              className="h-20 w-40 object-cover rounded-lg"
            />
          </div>
        )}
        <input
          type="file"
          id="image"
          name="image"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-500 hover:file:bg-brand-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to keep current image
        </p>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
