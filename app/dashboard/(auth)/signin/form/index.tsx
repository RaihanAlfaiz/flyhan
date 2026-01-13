"use client";

import React, { FC, useActionState } from "react";
import { handleSignIn, ActionResult } from "./action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialFormState: ActionResult = {
  errorTitle: null,
  errorDesc: null,
  successTitle: null,
  successDesc: null,
};

const FormSignin: FC = () => {
  const [state, formAction, isPending] = useActionState(
    handleSignIn,
    initialFormState
  );

  return (
    <div className="w-full h-screen">
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          {state.errorTitle && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>{state.errorTitle}</strong>
              {state.errorDesc && <p>{state.errorDesc}</p>}
            </div>
          )}
          <form action={formAction} className="space-y-6">
            <Input type="email" placeholder="Email" name="email" required />
            <Input
              type="password"
              placeholder="Password"
              name="password"
              required
            />
            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormSignin;
