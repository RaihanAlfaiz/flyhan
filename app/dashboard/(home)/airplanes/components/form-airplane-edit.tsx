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
import { Plane, ImagePlus, Loader2 } from "lucide-react";

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
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!airplane) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Plane className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Pesawat tidak ditemukan</p>
      </div>
    );
  }

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
          defaultValue={airplane.code}
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
          defaultValue={airplane.name}
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
          Upload Foto Baru (Opsional)
        </Label>
        {airplane.image && (
          <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Foto saat ini:</p>
            <img
              src={airplane.image}
              alt={airplane.name}
              className="h-24 w-32 object-cover rounded-lg shadow-md"
            />
          </div>
        )}
        <Input
          type="file"
          id="image"
          placeholder="Upload Foto Baru"
          name="image"
          accept="image/jpeg,image/jpg,image/png"
          className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500">
          Kosongkan jika tidak ingin mengubah foto
        </p>
      </div>

      <SubmitButton />
    </form>
  );
};

export default FormAirplaneEdit;
