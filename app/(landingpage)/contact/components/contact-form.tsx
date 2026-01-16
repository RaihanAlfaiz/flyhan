"use client";

import { useActionState } from "react";
import { submitContact } from "../action";
import { Send, Loader2 } from "lucide-react";

const initialState = {
  success: false,
  message: "",
};

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContact,
    initialState
  );

  return (
    <form
      action={formAction}
      className="bg-flysha-bg-purple p-8 rounded-[20px] border border-white/5 space-y-6"
    >
      {state.success && (
        <div className="bg-green-500/20 text-green-300 p-4 rounded-lg border border-green-500/50 animate-in fade-in">
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-gray-300 font-medium">
          Full Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          className="w-full bg-flysha-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-flysha-light-purple transition-all placeholder:text-gray-600 focus:bg-white/5"
          placeholder="John Doe"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-gray-300 font-medium">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          className="w-full bg-flysha-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-flysha-light-purple transition-all placeholder:text-gray-600 focus:bg-white/5"
          placeholder="john@example.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-gray-300 font-medium">
          Subject
        </label>
        <select
          name="subject"
          id="subject"
          className="w-full bg-flysha-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-flysha-light-purple transition-all focus:bg-white/5 appearance-none"
        >
          <option value="General Inquiry">General Inquiry</option>
          <option value="Booking Support">Booking Support</option>
          <option value="Feedback">Feedback</option>
          <option value="Partnership">Partnership</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-gray-300 font-medium">
          Message
        </label>
        <textarea
          name="message"
          id="message"
          required
          rows={4}
          className="w-full bg-flysha-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-flysha-light-purple transition-all placeholder:text-gray-600 focus:bg-white/5 resize-none"
          placeholder="How can we help you?"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-flysha-light-purple text-flysha-black font-bold py-4 rounded-full hover:shadow-[0_10px_20px_0_#B88DFF] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending ? (
          <Loader2 className="animate-spin w-5 h-5" />
        ) : (
          <Send className="w-5 h-5" />
        )}
        {isPending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
