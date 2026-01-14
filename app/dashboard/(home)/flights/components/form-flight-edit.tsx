"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useActionState, useEffect, useState, type FC } from "react";
import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import { updateFlight } from "../lib/actions";
import { getFlightById } from "../lib/data";
import { useFormStatus } from "react-dom";
import type { Flight, Airplane, FlightSeat } from "@prisma/client";
import {
  Plane,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  Loader2,
} from "lucide-react";

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
    <Button
      disabled={pending}
      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 py-6 text-lg font-semibold"
      type="submit"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Menyimpan...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Update
        </span>
      )}
    </Button>
  );
};

// Format date for datetime-local input
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

  const updateFlightWithId = updateFlight.bind(null, id);
  const [state, formAction] = useActionState(
    updateFlightWithId,
    initialFormState
  );

  useEffect(() => {
    const fetchFlight = async () => {
      const data = await getFlightById(id);
      setFlight(data as FlightWithRelations);
      setLoading(false);
    };
    fetchFlight();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Plane className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Penerbangan tidak ditemukan</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="w-full space-y-8">
      {state.errorTitle && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 rounded-xl shadow-sm">
          <strong className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            {state.errorTitle}
          </strong>
          {state.errorDesc && <p className="mt-1 text-sm">{state.errorDesc}</p>}
        </div>
      )}

      {/* Row 1: Airplane & Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="planeId"
            className="flex items-center gap-2 text-gray-700 font-medium"
          >
            <Plane className="h-4 w-4 text-blue-500" />
            Pilih pesawat
          </Label>
          <select
            id="planeId"
            name="planeId"
            required
            defaultValue={flight.planeId}
            className="flex h-12 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm ring-offset-background focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
          >
            <option value="">-- Pilih Pesawat --</option>
            {airplanes.map((plane) => (
              <option key={plane.id} value={plane.id}>
                {plane.name} ({plane.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Price Configuration Section */}
      <div className="relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-300 rounded-full" />
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          Harga Tiket
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-4">
          <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <Label
              htmlFor="priceEconomy"
              className="text-sm font-medium text-gray-700"
            >
              Economy Class
            </Label>
            <Input
              id="priceEconomy"
              name="priceEconomy"
              type="number"
              placeholder="IDR"
              defaultValue={(flight as any).priceEconomy || flight.price}
              required
              className="h-10 bg-white"
            />
          </div>

          <div className="space-y-2 p-4 bg-purple-50 rounded-xl border border-purple-100">
            <Label
              htmlFor="priceBusiness"
              className="text-sm font-medium text-purple-700"
            >
              Business Class
            </Label>
            <Input
              id="priceBusiness"
              name="priceBusiness"
              type="number"
              placeholder="IDR"
              defaultValue={
                (flight as any).priceBusiness ||
                Math.round(Number(flight.price) * 1.5)
              }
              required
              className="h-10 bg-white"
            />
          </div>

          <div className="space-y-2 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <Label
              htmlFor="priceFirst"
              className="text-sm font-medium text-amber-700"
            >
              First Class
            </Label>
            <Input
              id="priceFirst"
              name="priceFirst"
              type="number"
              placeholder="IDR"
              defaultValue={
                (flight as any).priceFirst ||
                Math.round(Number(flight.price) * 2.5)
              }
              required
              className="h-10 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Departure Section */}
      <div className="relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-300 rounded-full" />
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-500" />
          Keberangkatan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-4">
          <div className="space-y-2">
            <Label htmlFor="departureCity" className="text-gray-600">
              Kota Keberangkatan
            </Label>
            <Input
              id="departureCity"
              name="departureCity"
              placeholder="Bandung"
              defaultValue={flight.departureCity}
              required
              className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="departureDate"
              className="flex items-center gap-2 text-gray-600"
            >
              <Calendar className="h-4 w-4" />
              Tanggal & Waktu
            </Label>
            <Input
              id="departureDate"
              name="departureDate"
              type="datetime-local"
              defaultValue={formatDateForInput(flight.departureDate)}
              required
              className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="departureCityCode" className="text-gray-600">
              Kode Kota
            </Label>
            <Input
              id="departureCityCode"
              name="departureCityCode"
              placeholder="BDG"
              maxLength={5}
              defaultValue={flight.departureCityCode}
              required
              className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 uppercase font-bold text-center text-lg tracking-widest"
            />
          </div>
        </div>
      </div>

      {/* Arrow indicator */}
      <div className="flex justify-center">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg">
          <ArrowRight className="h-6 w-6 text-white rotate-90" />
        </div>
      </div>

      {/* Arrival Section */}
      <div className="relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-pink-300 rounded-full" />
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-pink-500" />
          Tujuan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-4">
          <div className="space-y-2">
            <Label htmlFor="destinationCity" className="text-gray-600">
              Kota Tujuan
            </Label>
            <Input
              id="destinationCity"
              name="destinationCity"
              placeholder="Jakarta"
              defaultValue={flight.destinationCity}
              required
              className="h-12 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="arrivalDate"
              className="flex items-center gap-2 text-gray-600"
            >
              <Calendar className="h-4 w-4" />
              Tanggal & Waktu Tiba
            </Label>
            <Input
              id="arrivalDate"
              name="arrivalDate"
              type="datetime-local"
              defaultValue={formatDateForInput(flight.arrivalDate)}
              required
              className="h-12 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destinationCityCode" className="text-gray-600">
              Kode Kota
            </Label>
            <Input
              id="destinationCityCode"
              name="destinationCityCode"
              placeholder="JKT"
              maxLength={5}
              defaultValue={flight.destinationCityCode}
              required
              className="h-12 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-200 uppercase font-bold text-center text-lg tracking-widest"
            />
          </div>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
};

export default FormFlightEdit;
