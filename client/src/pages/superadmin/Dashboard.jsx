import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle,
  XCircle,
  Users,
  IndianRupee,
  Wallet,
  TrendingUp,
  Repeat
} from "lucide-react";

import {
  getSuperAdminDashboard,
  getPlatformFinanceStats
} from "../../api/superAdmin.api";

import StatCard from "../../components/ui/StatCard";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [financeStats, setFinanceStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dashboardData = await getSuperAdminDashboard();
        const financeData = await getPlatformFinanceStats();

        setStats(dashboardData.stats);
        setRecentCompanies(dashboardData.recentCompanies);
        setFinanceStats(financeData.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-10">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Super Admin Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          Monitor system activity and platform revenue
        </p>
      </div>

      {/* ================= SYSTEM STATS ================= */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          System Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Companies"
            value={stats?.totalCompanies || 0}
            icon={Building2}
            color="bg-indigo-600"
          />

          <StatCard
            title="Active Companies"
            value={stats?.activeCompanies || 0}
            icon={CheckCircle}
            color="bg-green-500"
          />

          <StatCard
            title="Inactive Companies"
            value={stats?.inactiveCompanies || 0}
            icon={XCircle}
            color="bg-red-500"
          />

          <StatCard
            title="Total Admins"
            value={stats?.totalAdmins || 0}
            icon={Users}
            color="bg-blue-600"
          />
        </div>
      </div>

      {/* ================= FINANCIAL STATS ================= */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Financial Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`₹${financeStats?.totalRevenue || 0}`}
            icon={IndianRupee}
            color="bg-blue-600"
          />

          <StatCard
            title="Super Admin Earnings"
            value={`₹${financeStats?.totalCommission || 0}`}
            icon={TrendingUp}
            color="bg-indigo-600"
          />

          <StatCard
            title="Company Payout"
            value={`₹${financeStats?.totalCompanyEarning || 0}`}
            icon={Wallet}
            color="bg-green-600"
          />

          <StatCard
            title="Total Transactions"
            value={financeStats?.totalTransactions || 0}
            icon={Repeat}
            color="bg-gray-600"
          />
        </div>
      </div>

      {/* ================= RECENT COMPANIES ================= */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Recent Companies
        </h2>

        {recentCompanies.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No companies created yet.
          </p>
        ) : (
          <div className="divide-y">
            {recentCompanies.map((company) => (
              <div
                key={company._id}
                className="py-4 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {company.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {company.email || "No email provided"}
                  </p>
                </div>

                <p className="text-sm text-gray-400">
                  {new Date(company.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default SuperAdminDashboard;