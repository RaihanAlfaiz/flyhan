import { getAirplanesForSelect } from "../lib/data";
import FormFlight from "../components/form-flight";
import Link from "next/link";

export default async function CreateFlightPage() {
  const airplanes = await getAirplanesForSelect();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Add Flight</h1>
        <Link
          href="/dashboard/flights"
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          ← Back to List
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h6 className="text-[#4e73df] font-bold">Flight Details</h6>
        </div>
        <div className="p-6">
          <FormFlight airplanes={airplanes} />
        </div>
      </div>
    </div>
  );
}
