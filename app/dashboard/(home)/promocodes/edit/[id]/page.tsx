import FormPromoCode from "../../components/form-promo-code";
import { getPromoCodeById } from "../../lib/data";
import { redirect } from "next/navigation";
import Link from "next/link";

interface EditPromoCodePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPromoCodePage({
  params,
}: EditPromoCodePageProps) {
  const { id } = await params;
  const promoCode = await getPromoCodeById(id);

  if (!promoCode) {
    redirect("/dashboard/promocodes");
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Edit Promo Code</h1>
        <Link
          href="/dashboard/promocodes"
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          ← Back to List
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h6 className="text-[#4e73df] font-bold">Promo Code Details</h6>
        </div>
        <div className="p-6">
          <FormPromoCode type="EDIT" defaultValues={promoCode} />
        </div>
      </div>
    </div>
  );
}
