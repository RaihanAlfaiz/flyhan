import { getAirplanesForSelect } from "../../lib/data";
import FormFlightEdit from "../../components/form-flight-edit";
import { Plane, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditFlightPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFlightPage({ params }: EditFlightPageProps) {
  const { id } = await params;
  const airplanes = await getAirplanesForSelect();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/flights"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Edit Flight
            </h1>
            <p className="text-sm text-gray-500">Update data penerbangan</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <FormFlightEdit id={id} airplanes={airplanes} />
      </div>
    </div>
  );
}
