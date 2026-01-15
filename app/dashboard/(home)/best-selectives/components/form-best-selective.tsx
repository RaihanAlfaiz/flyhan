"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveBestSelective, ActionResult } from "../lib/actions";
import { BestSelective } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FormProps {
  data?: BestSelective | null;
}

const initialState: ActionResult = {
  errorTitle: null,
  errorDesc: null,
};

export default function FormBestSelective({ data }: FormProps) {
  const [state, formAction] = useActionState(saveBestSelective, initialState);

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
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="First Lounge"
          defaultValue={data?.title}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          name="subtitle"
          placeholder="Manhanggattan"
          defaultValue={data?.subtitle}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Redirect URL (Optional)</Label>
        <Input
          id="url"
          name="url"
          placeholder="https://..."
          defaultValue={data?.url || ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">
          {data ? "Change Image (Optional)" : "Upload Image"}
        </Label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          required={!data}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {/* Used standard shadcn input styles manually applied because type=file input component might act differently */}

        {data?.image && (
          <div className="mt-2 text-sm text-muted-foreground">
            Current:{" "}
            <a
              href={data.image}
              target="_blank"
              className="underline hover:text-primary"
            >
              View Image
            </a>
          </div>
        )}
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
