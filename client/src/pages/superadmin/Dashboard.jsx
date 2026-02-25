import { useEffect, useState } from "react";
import { Building2, CheckCircle, XCircle, Users } from "lucide-react";
import { getSuperAdminDashboard } from "../../api/superAdmin.api";
import StatCard from "../../components/ui/StatCard";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentCompanies, setRecentCompanies] = useState([]);

 
  useEffect(() => {
     const fetchDashboard = async () => {
    try {
      const data = await getSuperAdminDashboard();
      setStats(data.stats);
      setRecentCompanies(data.recentCompanies);
    } catch (error) {
      console.error(error); 
    }
  };
    fetchDashboard();
  }, []);

  if (!stats) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Super Admin Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Overview of system performance and companies
        </p>
      </div>

      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Companies"
          value={stats.totalCompanies}
          icon={Building2}
          color="bg-indigo-600"
        />

        <StatCard
          title="Active Companies"
          value={stats.activeCompanies}
          icon={CheckCircle}
          color="bg-green-500"
        />

        <StatCard
          title="Inactive Companies"
          value={stats.inactiveCompanies}
          icon={XCircle}
          color="bg-red-500"
        />

        <StatCard
          title="Total Admins"
          value={stats.totalAdmins}
          icon={Users}
          color="bg-blue-600"
        />
      </div>

      {/* ================= RECENT COMPANIES ================= */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Companies
        </h2>

        {recentCompanies.length === 0 ? (
          <p className="text-gray-500 text-sm">No companies created yet.</p>
        ) : (
          <div className="divide-y">
            {recentCompanies.map((company) => (
              <div
                key={company._id}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-800">{company.name}</p>
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
