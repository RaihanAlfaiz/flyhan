import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageHeader from "../../ui/page-header/PageHeader";
import Button from "../../ui/button/Button";
import { getPackageOrderById } from "../lib/actions";
import OrderDetailContent from "./components/order-detail-content";

export default async function PackageOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getPackageOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Details"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Package Orders", href: "/dashboard/package-orders" },
          { label: order.code },
        ]}
        actions={
          <Link href="/dashboard/package-orders">
            <Button
              variant="outline"
              startIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Orders
            </Button>
          </Link>
        }
      />

      <OrderDetailContent order={order} />
    </div>
  );
}
