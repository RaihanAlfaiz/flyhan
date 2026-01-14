"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useActionState, useEffect, useState, type FC } from "react";
import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import { updateAirplane } from "../lib/actions";
import { getAirplaneById } from "../lib/data";
import { useFormStatus } from "react-dom";
import type { Airplane } from "@prisma/client";
import { Loader2 } from "lucide-react";

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
    <button
      disabled={pending}
      type="submit"
      className="px-4 py-2 bg-[#4e73df] hover:bg-[#2e59d9] text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
    >
      {pending ? "Updating..." : "Update Airplane"}
    </button>
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
        <Loader2 className="h-6 w-6 animate-spin text-[#4e73df]" />
      </div>
    );
  }

  if (!airplane) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Airplane not found</p>
      </div>
    );
  }

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
          defaultValue={airplane.code}
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
          defaultValue={airplane.name}
          required
          className="h-10 rounded border-gray-300 focus:border-[#4e73df] focus:ring-[#4e73df]"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="image" className="text-sm font-medium text-gray-700">
          Upload New Image (Optional)
        </Label>
        {airplane.image && (
          <div className="mb-3 p-3 bg-gray-50 rounded border">
            <p className="text-xs text-gray-500 mb-2">Current image:</p>
            <img
              src={airplane.image}
              alt={airplane.name}
              className="h-20 w-32 object-cover rounded"
            />
          </div>
        )}
        <Input
          type="file"
          id="image"
          name="image"
          accept="image/jpeg,image/jpg,image/png"
          className="h-10 rounded border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
        <p className="text-xs text-gray-500">
          Leave empty to keep current image
        </p>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
};

export default FormAirplaneEdit;
