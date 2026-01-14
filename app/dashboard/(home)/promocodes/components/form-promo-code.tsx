"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useActionState, type FC } from "react";
import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import { savePromoCode, updatePromoCode } from "../lib/actions";
import { useFormStatus } from "react-dom";
import { PromoCode } from "@prisma/client";

interface FormPromoCodeProps {
  type: "ADD" | "EDIT";
  defaultValues?: PromoCode | null;
}

const initialFormState: ActionResult = {
  errorTitle: null,
  errorDesc: null,
  successTitle: null,
  successDesc: null,
};

const SubmitButton = ({ type }: { type: "ADD" | "EDIT" }) => {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      type="submit"
      className="px-4 py-2 bg-[#4e73df] hover:bg-[#2e59d9] text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
    >
      {pending
        ? "Saving..."
        : type === "ADD"
        ? "Save Promo Code"
        : "Update Promo Code"}
    </button>
  );
};

const FormPromoCode: FC<FormPromoCodeProps> = ({ type, defaultValues }) => {
  const updateAction = updatePromoCode.bind(null, defaultValues?.id as string);
  const actionToUse = type === "ADD" ? savePromoCode : updateAction;

  const [state, formAction] = useActionState(actionToUse, initialFormState);

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
          Promo Code
        </Label>
        <Input
          id="code"
          name="code"
          placeholder="e.g. DISCOUNT2024"
          defaultValue={defaultValues?.code}
          required
          className="h-10 rounded border-gray-300 focus:border-[#4e73df] focus:ring-[#4e73df]"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="discount" className="text-sm font-medium text-gray-700">
          Discount Amount (IDR)
        </Label>
        <Input
          id="discount"
          name="discount"
          type="number"
          placeholder="e.g. 50000"
          defaultValue={defaultValues?.discount}
          required
          className="h-10 rounded border-gray-300 focus:border-[#4e73df] focus:ring-[#4e73df]"
        />
      </div>

      <div className="space-y-1">
        <Label
          htmlFor="validUntil"
          className="text-sm font-medium text-gray-700"
        >
          Valid Until
        </Label>
        <Input
          id="validUntil"
          name="validUntil"
          type="datetime-local"
          defaultValue={
            defaultValues?.validUntil
              ? new Date(defaultValues.validUntil).toISOString().slice(0, 16)
              : ""
          }
          className="h-10 rounded border-gray-300 focus:border-[#4e73df] focus:ring-[#4e73df]"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          defaultChecked={defaultValues?.isActive ?? true}
          className="w-4 h-4 rounded border-gray-300 text-[#4e73df] focus:ring-[#4e73df]"
        />
        <Label
          htmlFor="isActive"
          className="text-sm font-medium text-gray-700 cursor-pointer"
        >
          Active
        </Label>
      </div>

      <div className="pt-2">
        <SubmitButton type={type} />
      </div>
    </form>
  );
};

export default FormPromoCode;
