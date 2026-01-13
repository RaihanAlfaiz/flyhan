"use client";

import { useParams } from "next/navigation";
import FormAirplaneEdit from "../../components/form-airplane-edit";

export default function EditAirplanePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Edit Airplane</h1>
      <FormAirplaneEdit id={id} />
    </div>
  );
}
