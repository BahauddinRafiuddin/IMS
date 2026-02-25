import { useEffect, useState } from "react";
import StatCard from "../../components/ui/StatCard";
import {
  Users,
  UserCheck,
  UserX,
  BookOpen,
  CheckCircle,
  Activity
} from "lucide-react";
import { getDashboardData } from "../../api/admin.api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await getDashboardData();
        setStats(res.dashboard);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-20 text-center text-red-500">
        Failed to load dashboard
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1">
          System summary and real-time statistics
        </p>
      </div>

      {/* ================= STATS GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

        <StatCard
          title="Total Interns"
          value={stats.totalInterns}
          icon={Users}
          color="bg-blue-600"
        />

        <StatCard
          title="Active Interns"
          value={stats.activeInterns}
          icon={UserCheck}
          color="bg-green-600"
        />

        <StatCard
          title="Inactive Interns"
          value={stats.inactiveInterns}
          icon={UserX}
          color="bg-red-600"
        />

        <StatCard
          title="Total Programs"
          value={stats.totalPrograms}
          icon={BookOpen}
          color="bg-yellow-500"
        />

        <StatCard
          title="Active Programs"
          value={stats.activePrograms}
          icon={Activity}
          color="bg-indigo-600"
        />

        <StatCard
          title="Completed Programs"
          value={stats.completedPrograms}
          icon={CheckCircle}
          color="bg-purple-600"
        />

      </div>
    </div>
  );
};

export default AdminDashboard;