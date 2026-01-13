"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useActionState, useEffect, useState, type FC } from "react";
import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import { updateAirplane } from "../lib/actions";
import { getAirplaneById } from "../lib/data";
import { useFormStatus } from "react-dom";
import type { Airplane } from "@prisma/client";

interface FormAirplaneEditProps {
  id: string;
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
    <Button disabled={pending} className="w-full" type="submit">
      {pending ? "Menyimpan..." : "Update"}
    </Button>
  );
};

const FormAirplaneEdit: FC<FormAirplaneEditProps> = ({ id }) => {
  const [airplane, setAirplane] = useState<Airplane | null>(null);
  const [loading, setLoading] = useState(true);

  const updateAirplaneWithId = updateAirplane.bind(null, id);
  const [state, formAction] = useActionState(
    updateAirplaneWithId,
    initialFormState
  );

  useEffect(() => {
    const fetchAirplane = async () => {
      const data = await getAirplaneById(id);
      setAirplane(data);
      setLoading(false);
    };
    fetchAirplane();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!airplane) {
    return <div>Pesawat tidak ditemukan</div>;
  }

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
        <Input
          id="code"
          placeholder="Contoh: GIA-001"
          name="code"
          defaultValue={airplane.code}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nama Pesawat</Label>
        <Input
          id="name"
          placeholder="Contoh: Garuda Indonesia Boeing 737"
          name="name"
          defaultValue={airplane.name}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Upload Foto Baru (Opsional)</Label>
        {airplane.image && (
          <div className="mb-2">
            <p className="text-sm text-gray-500 mb-1">Foto saat ini:</p>
            <img
              src={airplane.image}
              alt={airplane.name}
              className="h-24 w-32 object-cover rounded-md"
            />
          </div>
        )}
        <Input
          type="file"
          id="image"
          placeholder="Upload Foto Baru"
          name="image"
          accept="image/jpeg,image/jpg,image/png"
        />
        <p className="text-sm text-gray-500">
          Kosongkan jika tidak ingin mengubah foto
        </p>
      </div>
      <SubmitButton />
    </form>
  );
};

export default FormAirplaneEdit;
