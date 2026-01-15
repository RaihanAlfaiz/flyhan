"use client";

import React, { useActionState, useEffect, useState, type FC } from "react";
import { updatePackage, getPackageById } from "../lib/actions";
import { useFormStatus } from "react-dom";
import type { FlightPackage } from "@prisma/client";
import { Loader2 } from "lucide-react";
import Input from "../../ui/input/Input";
import Label from "../../ui/label/Label";
import Button from "../../ui/button/Button";

interface FormPackageEditProps {
  id: string;
}

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
      {pending ? "Updating..." : "Update Package"}
    </Button>
  );
};

const FormPackageEdit: FC<FormPackageEditProps> = ({ id }) => {
  const [pkg, setPkg] = useState<FlightPackage | null>(null);
  const [loading, setLoading] = useState(true);

  const updatePackageWithId = updatePackage.bind(null, id);
  const [state, formAction] = useActionState(
    updatePackageWithId,
    initialFormState
  );

  useEffect(() => {
    const fetchPackage = async () => {
      const data = await getPackageById(id);
      setPkg(data);
      setLoading(false);
    };
    fetchPackage();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Package not found</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.errorTitle && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
          <strong>{state.errorTitle}</strong>
          {state.errorDesc && <p className="mt-1">{state.errorDesc}</p>}
        </div>
      )}

      <div>
        <Label htmlFor="title" required>
          Package Title
        </Label>
        <Input
          id="title"
          placeholder="e.g. Bali Getaway"
          name="title"
          defaultValue={pkg.title}
          required
        />
      </div>

      <div>
        <Label htmlFor="price" required>
          Harga (Rp)
        </Label>
        <Input
          id="price"
          type="number"
          placeholder="500000"
          name="price"
          defaultValue={pkg.price}
          required
          min="0"
        />
      </div>

      <div>
        <Label htmlFor="description" required>
          Description
        </Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          defaultValue={pkg.description}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:ring-brand-500/20"
          placeholder="Describe the package..."
        />
      </div>

      <div>
        <Label htmlFor="features" required>
          Features (Comma separated)
        </Label>
        <Input
          id="features"
          placeholder="e.g. Hotel 5 Stars, Flight Included, Daily Breakfast"
          name="features"
          defaultValue={pkg.features.join(", ")}
          required
        />
        <p className="mt-1.5 text-xs text-gray-500">
          Separate items with commas
        </p>
      </div>

      <div>
        <Label htmlFor="image">Upload New Image (Optional)</Label>
        {pkg.image && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
            <p className="text-xs text-gray-500 mb-2">Current image:</p>
            <img
              src={pkg.image}
              alt={pkg.title}
              className="h-24 w-40 object-cover rounded-lg"
            />
          </div>
        )}
        <input
          type="file"
          id="image"
          name="image"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-500 hover:file:bg-brand-100 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          Leave empty to keep current image. Format: JPG, JPEG, PNG, WEBP. Max
          2MB.
        </p>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
};

export default FormPackageEdit;
