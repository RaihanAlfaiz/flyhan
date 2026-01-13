"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useActionState, type FC } from "react";
import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import { saveAirplane } from "../lib/actions";
import { useFormStatus } from "react-dom";

// interface FormAirplaneProps {}
const initialFormState: ActionResult = {
  errorTitle: null,
  errorDesc: null,
  successTitle: null,
  successDesc: null,
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} className="w-full" type="submit">
      Simpan
    </Button>
  );
};

const FormAirplane: FC = () => {
  const [state, formAction, isPending] = useActionState(
    saveAirplane,
    initialFormState
  );
  return (
    <form action={formAction} className="w-full max-w-md space-y-4">
      {state.errorTitle && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>{state.errorTitle}</strong>
          {state.errorDesc && <p>{state.errorDesc}</p>}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="code">Kode Pesawat</Label>
        <Input id="code" placeholder="Contoh: GIA-001" name="code" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nama Pesawat</Label>
        <Input
          id="name"
          placeholder="Contoh: Garuda Indonesia Boeing 737"
          name="name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Upload Foto</Label>
        <Input
          type="file"
          id="image"
          placeholder="Upload Foto"
          name="image"
          accept="image/jpeg,image/jpg,image/png"
          required
        />
      </div>
      <SubmitButton />
    </form>
  );
};

export default FormAirplane;
