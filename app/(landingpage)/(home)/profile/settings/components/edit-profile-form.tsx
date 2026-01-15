"use client";

import { useActionState, useState } from "react"; // Next 14/15 uses useActionState or useFormState
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { User } from "lucia";
import { updateProfile, changePassword } from "../lib/actions";
import { Loader2, Upload, Camera } from "lucide-react";
import Swal from "sweetalert2";

// --- Edit Profile Form ---

const initialState = {
  errorTitle: null,
  errorDesc: null,
  successTitle: null,
  successDesc: null,
};

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-flysha-light-purple text-flysha-black font-bold h-[48px] px-6 rounded-full w-full hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? <Loader2 className="animate-spin w-5 h-5" /> : text}
    </button>
  );
}

export function EditProfileForm({ user }: { user: User }) {
  const [state, formAction] = useActionState(updateProfile, initialState); // or useFormState
  const [preview, setPreview] = useState<string | null>(user.avatar || null);

  // Check state changes for alerts
  if (state.successTitle) {
    Swal.fire({
      icon: "success",
      title: state.successTitle,
      text: state.successDesc!,
      timer: 2000,
      showConfirmButton: false,
    });
    // Reset state hack if needed, but in nextjs action state persists until reload or new action
  }
  if (state.errorTitle) {
    Swal.fire({
      icon: "error",
      title: state.errorTitle,
      text: state.errorDesc!,
    });
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  return (
    <form
      action={formAction}
      className="flex flex-col gap-6 bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 h-fit"
    >
      <h2 className="font-bold text-xl text-flysha-black border-b pb-4">
        Edit Profile
      </h2>

      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-[100px] h-[100px] rounded-full overflow-hidden bg-flysha-bg-purple/20 border-2 border-dashed border-flysha-light-purple flex items-center justify-center group cursor-pointer">
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="font-bold text-3xl text-flysha-light-purple">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <Camera className="text-white w-6 h-6" />
          </div>

          <input
            type="file"
            name="avatar"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleImageChange}
          />
        </div>
        <p className="text-xs text-gray-400">
          Allowed JPG, GIF or PNG. Max size of 800K
        </p>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-flysha-black">Full Name</label>
          <input
            name="name"
            defaultValue={user.name}
            className="w-full h-[48px] rounded-full border border-gray-300 px-5 focus:border-flysha-light-purple focus:ring-1 focus:ring-flysha-light-purple outline-none transition-all text-flysha-black"
            placeholder="Your Full Name"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-flysha-black">
            Email Address
          </label>
          <input
            defaultValue={user.email}
            readOnly
            disabled
            className="w-full h-[48px] rounded-full border border-gray-200 bg-gray-50 px-5 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-flysha-black">
            Passport Number
          </label>
          <input
            name="passport"
            defaultValue={user.passport || ""}
            className="w-full h-[48px] rounded-full border border-gray-300 px-5 focus:border-flysha-light-purple focus:ring-1 focus:ring-flysha-light-purple outline-none transition-all text-flysha-black"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="mt-2">
        <SubmitButton text="Save Changes" />
      </div>
    </form>
  );
}

// --- Change Password Form ---

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePassword, initialState);

  // Check state changes for alerts (Duplicate logic but okay for now)
  if (state.successTitle) {
    Swal.fire({
      icon: "success",
      title: state.successTitle,
      text: state.successDesc!,
      timer: 2000,
      showConfirmButton: false,
    });
  }
  if (state.errorTitle) {
    Swal.fire({
      icon: "error",
      title: state.errorTitle,
      text: state.errorDesc!,
    });
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-6 bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 h-fit"
    >
      <h2 className="font-bold text-xl text-flysha-black border-b pb-4">
        Change Password
      </h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-flysha-black">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            className="w-full h-[48px] rounded-full border border-gray-300 px-5 focus:border-flysha-light-purple focus:ring-1 focus:ring-flysha-light-purple outline-none transition-all text-flysha-black"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-flysha-black">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            className="w-full h-[48px] rounded-full border border-gray-300 px-5 focus:border-flysha-light-purple focus:ring-1 focus:ring-flysha-light-purple outline-none transition-all text-flysha-black"
            placeholder="Min 6 chars"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-flysha-black">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            className="w-full h-[48px] rounded-full border border-gray-300 px-5 focus:border-flysha-light-purple focus:ring-1 focus:ring-flysha-light-purple outline-none transition-all text-flysha-black"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <div className="mt-2 text-right">
        <SubmitButton text="Update Password" />
      </div>
    </form>
  );
}
