"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveFlightAddon, AddonActionResult } from "../lib/actions";
import { FlightAddon } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FormProps {
  data?: FlightAddon | null;
}

const initialState: AddonActionResult = {
  errorTitle: null,
  errorDesc: null,
};

export default function FormFlightAddon({ data }: FormProps) {
  const [state, formAction] = useActionState(saveFlightAddon, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.errorTitle && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-md">
          <p className="font-bold">{state.errorTitle}</p>
          <ul className="list-disc ml-5">
            {state.errorDesc?.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {data && <input type="hidden" name="id" value={data.id} />}

      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input
          id="code"
          name="code"
          placeholder="PICKUP"
          defaultValue={data?.code}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Home Pickup"
          defaultValue={data?.title}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          name="description"
          placeholder="Description of service..."
          defaultValue={data?.description || ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (IDR)</Label>
        <Input
          type="number"
          id="price"
          name="price"
          placeholder="100000"
          defaultValue={data?.price}
          required
        />
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}
