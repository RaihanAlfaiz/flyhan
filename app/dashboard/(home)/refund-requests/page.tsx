import { getRefundRequests } from "./lib/data";
import {
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import PageHeader from "../ui/page-header/PageHeader";
import { Card, CardHeader, CardTitle } from "../ui/card/Card";
import MetricCard from "../ui/metric-card/MetricCard";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: bigint | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

export default async function RefundRequestsPage() {
  const requests = await getRefundRequests();

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Refund Requests"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Refund Requests" },
        ]}
        actions={
          pendingCount > 0 && (
            <Badge color="warning" size="md">
              <AlertCircle className="h-4 w-4" />
              {pendingCount} pending requests
            </Badge>
          )
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        <MetricCard
          title="Total Requests"
          value={requests.length.toString()}
          icon={
            <RefreshCw className="text-gray-800 dark:text-white/90 w-6 h-6" />
          }
          iconBgColor="bg-brand-50 dark:bg-brand-500/15"
        />
        <MetricCard
          title="Pending"
          value={pendingCount.toString()}
          icon={<Clock className="text-gray-800 dark:text-white/90 w-6 h-6" />}
          iconBgColor="bg-amber-50 dark:bg-amber-500/15"
        />
        <MetricCard
          title="Approved"
          value={approvedCount.toString()}
          icon={
            <CheckCircle className="text-gray-800 dark:text-white/90 w-6 h-6" />
          }
          iconBgColor="bg-green-50 dark:bg-green-500/15"
        />
        <MetricCard
          title="Rejected"
          value={rejectedCount.toString()}
          icon={
            <XCircle className="text-gray-800 dark:text-white/90 w-6 h-6" />
          }
          iconBgColor="bg-red-50 dark:bg-red-500/15"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>

        {requests.length === 0 ? (
          <div className="text-center py-16">
            <RefreshCw className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No refund requests yet
            </p>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                  >
                    Customer
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                  >
                    Ticket
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                  >
                    Flight
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                  >
                    Type
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                  >
                    Date
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {requests.map((request) => (
                  <TableRow
                    key={request.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <TableCell className="px-5 py-4 text-start">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white/90">
                          {request.ticket.customer.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {request.ticket.customer.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <span className="font-mono text-sm text-brand-500">
                        {request.ticket.code}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white/90">
                          {request.ticket.flight.departureCityCode} →{" "}
                          {request.ticket.flight.destinationCityCode}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {request.ticket.flight.plane.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <Badge
                        size="sm"
                        color={request.type === "REFUND" ? "error" : "info"}
                      >
                        {request.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 font-medium text-sm dark:text-white/90">
                      {formatCurrency(request.ticket.price)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <Badge
                        size="sm"
                        color={
                          request.status === "PENDING"
                            ? "warning"
                            : request.status === "APPROVED"
                            ? "success"
                            : "error"
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-sm dark:text-gray-400">
                      {formatDate(request.createdAt)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <Link href={`/dashboard/refund-requests/${request.id}`}>
                        <Button size="sm">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
