"use client";

import { useActionState } from "react";
import { handleSignUp, ActionResult } from "../lib/action";
import Link from "next/link";

const initialFormState: ActionResult = {
  errorTitle: null,
  errorDesc: null,
  successTitle: null,
  successDesc: null,
};

export default function FormSignup() {
  const [state, formAction, isPending] = useActionState(
    handleSignUp,
    initialFormState
  );

  return (
    <form
      action={formAction}
      className="bg-white text-flysha-black w-[500px] flex flex-col rounded-[20px] gap-5 p-5"
    >
      {/* Error Message */}
      {state.errorTitle && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong className="font-semibold">{state.errorTitle}</strong>
          {state.errorDesc && <p className="text-sm mt-1">{state.errorDesc}</p>}
        </div>
      )}

      {/* Name & Passport */}
      <div className="flex gap-5">
        <div className="flex flex-col gap-2 flex-1">
          <label htmlFor="name" className="font-medium">
            Complete Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Write your name"
            required
            className="rounded-full w-full px-5 py-3 bg-[#EDE8F5] appearance-none outline-none font-semibold focus:ring-2 focus:ring-flysha-light-purple transition-all"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <label htmlFor="passport" className="font-medium">
            No. Passport
          </label>
          <input
            type="text"
            name="passport"
            id="passport"
            placeholder="Write passport number"
            className="rounded-full w-full px-5 py-3 bg-[#EDE8F5] appearance-none outline-none font-semibold focus:ring-2 focus:ring-flysha-light-purple transition-all"
          />
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="font-medium">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Write your email"
          required
          className="rounded-full w-full px-5 py-3 bg-[#EDE8F5] appearance-none outline-none font-semibold focus:ring-2 focus:ring-flysha-light-purple transition-all"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="font-medium">
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Type your password (min 6 characters)"
          required
          minLength={6}
          className="rounded-full w-full px-5 py-3 bg-[#EDE8F5] appearance-none outline-none font-semibold focus:ring-2 focus:ring-flysha-light-purple transition-all"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="text-center text-flysha-black rounded-full bg-flysha-light-purple font-bold w-full px-[30px] py-[12px] transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Creating Account..." : "Create New Account"}
      </button>

      {/* Sign In Link */}
      <Link
        href="/signin"
        className="text-center text-flysha-black hover:text-white rounded-full bg-white hover:bg-flysha-black font-semibold w-full px-[30px] py-[12px] border border-flysha-black transition-all duration-300"
      >
        Sign In
      </Link>
    </form>
  );
}
