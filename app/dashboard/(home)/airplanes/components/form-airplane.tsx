"use client";

import React, { useActionState, type FC } from "react";
import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import { saveAirplane } from "../lib/actions";
import { useFormStatus } from "react-dom";
import Input from "../../ui/input/Input";
import Label from "../../ui/label/Label";
import Button from "../../ui/button/Button";

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
      {pending ? "Saving..." : "Save Airplane"}
    </Button>
  );
};

const FormAirplane: FC = () => {
  const [state, formAction] = useActionState(saveAirplane, initialFormState);

  return (
    <form action={formAction} className="space-y-5">
      {state.errorTitle && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
          <strong>{state.errorTitle}</strong>
          {state.errorDesc && <p className="mt-1">{state.errorDesc}</p>}
        </div>
      )}

      <div>
        <Label htmlFor="code" required>
          Airplane Code
        </Label>
        <Input id="code" placeholder="e.g. GIA-001" name="code" required />
      </div>

      <div>
        <Label htmlFor="name" required>
          Airplane Name
        </Label>
        <Input
          id="name"
          placeholder="e.g. Boeing 737-800"
          name="name"
          required
        />
      </div>

      <div>
        <Label htmlFor="image" required>
          Upload Image
        </Label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/jpeg,image/jpg,image/png"
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-500 hover:file:bg-brand-100 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
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
