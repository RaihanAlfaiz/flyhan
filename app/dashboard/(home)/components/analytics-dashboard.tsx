"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import { getDashboardData, DashboardPeriod } from "../lib/data";
import { Download, TrendingUp, Users, DollarSign, Map } from "lucide-react";

// Local formatter
const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("daily");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [period]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getDashboardData(period);
      setData(res);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  const exportExcel = () => {
    if (!data) return;

    // Format data for excel
    const excelData = data.tableData.map((item: any) => ({
      "Ticket Code": item.code,
      "Flight Route": item.flight,
      "Booking Date": new Date(item.date).toLocaleDateString(),
      Price: item.price,
      Status: item.status,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `FlyHan_Report_${period}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) return <div className="p-4 text-red-500">Failed to load data</div>;

  return (
    <div className="space-y-6 mb-8 rounded-xl bg-white border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800 p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground text-sm">
            Overview of your airline performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as DashboardPeriod)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="daily">Last 30 Days</option>
              <option value="weekly">Last 12 Weeks</option>
              <option value="monthly">Last 12 Months</option>
            </select>
          </div>

          <button
            onClick={exportExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatRupiah(data.totalRevenue)}
          icon={<DollarSign className="w-5 h-5 text-green-600" />}
          bgClass="bg-green-50"
        />
        <StatCard
          title="Total Bookings"
          value={data.totalBookings}
          icon={<Users className="w-5 h-5 text-blue-600" />}
          bgClass="bg-blue-50"
        />
        <StatCard
          title="Conversion Rate"
          value={`${data.conversionRate.toFixed(1)}%`}
          icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
          bgClass="bg-purple-50"
        />
        <StatCard
          title="Top Route"
          value={data.popularRoutes[0]?.route || "N/A"}
          icon={<Map className="w-5 h-5 text-orange-600" />}
          bgClass="bg-orange-50"
          subVal={
            data.popularRoutes[0]
              ? `${data.popularRoutes[0].count} bookings`
              : ""
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-lg mb-6">Revenue Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.3}
                />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip
                  formatter={(value: number) => formatRupiah(value)}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Routes Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-lg mb-6">Popular Routes</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.popularRoutes}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  opacity={0.3}
                />
                <XAxis
                  type="number"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="route"
                  type="category"
                  fontSize={12}
                  width={100}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f3f4f6" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#10b981"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bgClass, subVal }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
        {subVal && <p className="text-xs text-gray-400 mt-1">{subVal}</p>}
      </div>
      <div className={`p-3 rounded-lg ${bgClass}`}>{icon}</div>
    </div>
  );
}
