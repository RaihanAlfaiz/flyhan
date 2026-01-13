"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useActionState, type FC } from "react";
import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import { saveAirplane } from "../lib/actions";
import { useFormStatus } from "react-dom";
import { Plane, ImagePlus } from "lucide-react";

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
          Simpan
        </span>
      )}
    </Button>
  );
};

const FormAirplane: FC = () => {
  const [state, formAction] = useActionState(saveAirplane, initialFormState);

  return (
    <form action={formAction} className="w-full max-w-md space-y-6">
      {state.errorTitle && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 rounded-xl shadow-sm">
          <strong className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            {state.errorTitle}
          </strong>
          {state.errorDesc && <p className="mt-1 text-sm">{state.errorDesc}</p>}
        </div>
      )}

      <div className="space-y-2">
        <Label
          htmlFor="code"
          className="flex items-center gap-2 text-gray-700 font-medium"
        >
          <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600">
            #
          </span>
          Kode Pesawat
        </Label>
        <Input
          id="code"
          placeholder="Contoh: GIA-001"
          name="code"
          required
          className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="name"
          className="flex items-center gap-2 text-gray-700 font-medium"
        >
          <Plane className="h-4 w-4 text-indigo-500" />
          Nama Pesawat
        </Label>
        <Input
          id="name"
          placeholder="Contoh: Garuda Indonesia Boeing 737"
          name="name"
          required
          className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="image"
          className="flex items-center gap-2 text-gray-700 font-medium"
        >
          <ImagePlus className="h-4 w-4 text-purple-500" />
          Upload Foto
        </Label>
        <div className="relative">
          <Input
            type="file"
            id="image"
            placeholder="Upload Foto"
            name="image"
            accept="image/jpeg,image/jpg,image/png"
            required
            className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <p className="text-xs text-gray-500">
          Format: JPG, JPEG, PNG. Maksimal 5MB.
        </p>
      </div>

      <SubmitButton />
    </form>
  );
};

export default FormAirplane;
