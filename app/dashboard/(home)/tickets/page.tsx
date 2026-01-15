import { Ticket } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getTickets } from "./lib/data";
import PageHeader from "../ui/page-header/PageHeader";
import { Card, CardHeader, CardTitle } from "../ui/card/Card";

export default async function TicketsPage() {
  const tickets = await getTickets();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Tickets" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
        </CardHeader>
        {tickets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Ticket className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No Tickets Yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tickets will appear after customers make bookings.
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={tickets as any}
            searchPlaceholder="Search tickets..."
          />
        )}
      </Card>
    </div>
  );
}
