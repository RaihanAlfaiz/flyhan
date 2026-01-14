"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useActionState, type FC } from "react";
import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import { saveAirplane } from "../lib/actions";
import { useFormStatus } from "react-dom";

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
      {pending ? "Saving..." : "Save Airplane"}
    </button>
  );
};

const FormAirplane: FC = () => {
  const [state, formAction] = useActionState(saveAirplane, initialFormState);

  return (
    <form action={formAction} className="space-y-4">
      {state.errorTitle && (
        <div className="p-3 bg-[#e74a3b]/10 border border-[#e74a3b]/20 text-[#e74a3b] rounded text-sm">
          <strong>{state.errorTitle}</strong>
          {state.errorDesc && <p className="mt-1">{state.errorDesc}</p>}
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="code" className="text-sm font-medium text-gray-700">
          Airplane Code
        </Label>
        <Input
          id="code"
          placeholder="e.g. GIA-001"
          name="code"
          required
          className="h-10 rounded border-gray-300 focus:border-[#4e73df] focus:ring-[#4e73df]"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
          Airplane Name
        </Label>
        <Input
          id="name"
          placeholder="e.g. Boeing 737-800"
          name="name"
          required
          className="h-10 rounded border-gray-300 focus:border-[#4e73df] focus:ring-[#4e73df]"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="image" className="text-sm font-medium text-gray-700">
          Upload Image
        </Label>
        <Input
          type="file"
          id="image"
          name="image"
          accept="image/jpeg,image/jpg,image/png"
          required
          className="h-10 rounded border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
        <p className="text-xs text-gray-500">
          Format: JPG, JPEG, PNG. Max 5MB.
        </p>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
};

export default FormAirplane;
