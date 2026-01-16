import { getSettings, initializeDefaultSettings } from "./lib/actions";
import SettingsForm from "./components/settings-form";
import PageHeader from "../ui/page-header/PageHeader";
import { Card, CardHeader, CardTitle } from "../ui/card/Card";
import { Settings, Percent, Plane } from "lucide-react";

export default async function SettingsPage() {
  // Initialize default settings if not exist
  await initializeDefaultSettings();

  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="App Settings"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Round Trip Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/15 flex items-center justify-center">
                <Plane className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <CardTitle>Round Trip Settings</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configure discount for round trip bookings
                </p>
              </div>
            </div>
          </CardHeader>
          <div className="p-6 pt-0">
            <SettingsForm
              settingKey="round_trip_discount"
              label="Round Trip Discount"
              description="Percentage discount applied when customer books departure and return flights together"
              currentValue={settings.round_trip_discount || "10"}
              type="number"
              suffix="%"
              min={0}
              max={50}
            />
          </div>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/15 flex items-center justify-center">
                <Settings className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <CardTitle>How It Works</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Round trip booking flow
                </p>
              </div>
            </div>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold shrink-0">
                1
              </span>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  Customer searches round trip
                </p>
                <p className="text-sm text-gray-500">
                  Toggle "Round Trip" and select return date
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold shrink-0">
                2
              </span>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  Select departure & return flights
                </p>
                <p className="text-sm text-gray-500">
                  Choose from available flights for both legs
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold shrink-0">
                3
              </span>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  Discount auto-applied
                </p>
                <p className="text-sm text-gray-500">
                  {settings.round_trip_discount || 10}% discount on total
                  booking
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold shrink-0">
                ✓
              </span>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  Complete payment
                </p>
                <p className="text-sm text-gray-500">
                  Both tickets issued in single transaction
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-500/10 dark:to-purple-500/10 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-5 h-5 text-brand-500" />
                <span className="font-bold text-gray-800 dark:text-white">
                  Current Discount
                </span>
              </div>
              <p className="text-3xl font-bold text-brand-500">
                {settings.round_trip_discount || 10}%
              </p>
              <p className="text-sm text-gray-500">
                Applied to round trip bookings
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
