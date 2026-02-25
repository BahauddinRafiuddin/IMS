import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import StatCard from "../../components/ui/StatCard";
import { getMenorDashboard } from "../../api/mentor.api";

const MentorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentPrograms, setRecentPrograms] = useState([]);

  useEffect(() => {
    const fetchMentorDashboardData = async () => {
      try {
        const res = await getMenorDashboard();

        setStats(res.dashboard);
        setRecentTasks(res.recentTasks || []);
        setRecentPrograms(res.recentPrograms || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading mentor dashboard...
      </div>
    );
  }

  // console.log(stats)
  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Mentor Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Manage programs, interns and task reviews
        </p>
      </div>

      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Programs"
          value={stats.totalPrograms || 0}
          icon={BookOpen}
          color="bg-indigo-600"
        />

        <StatCard
          title="Active Programs"
          value={stats.activePrograms || 0}
          icon={BookOpen}
          color="bg-blue-600"
        />

        <StatCard
          title="Interns"
          value={stats.totalInterns || 0}
          icon={Users}
          color="bg-purple-600"
        />

        <StatCard
          title="Tasks"
          value={stats.totalTasks || 0}
          icon={ClipboardList}
          color="bg-gray-700"
        />

        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews || 0}
          icon={Clock}
          color="bg-yellow-500"
        />

        <StatCard
          title="Approved"
          value={stats.approvedTasks || 0}
          icon={CheckCircle}
          color="bg-green-600"
        />
      </div>

      {/* ================= RECENT PROGRAMS ================= */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Programs</h2>

        {!recentPrograms.length ? (
          <div className="bg-white p-6 rounded-xl shadow text-gray-500">
            No programs assigned yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recentPrograms.map((program) => (
              <div
                key={program._id}
                className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition"
              >
                <h3 className="text-lg font-bold">{program.title}</h3>

                <p className="text-sm text-gray-600 mt-1">
                  Domain: {program.domain}
                </p>

                {/* <p className="text-sm text-gray-600">
                  Interns: {program.interns?.length || 0}
                </p> */}

                <span
                  className={`inline-block mt-3 px-3 py-1 text-xs rounded-full font-semibold
                  ${
                    program.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {program.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= RECENT TASKS ================= */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>

        {!recentTasks.length ? (
          <div className="bg-white p-6 rounded-xl shadow text-gray-500">
            No tasks created yet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-5 py-4 text-left">Task</th>
                  <th className="px-5 py-4 text-left">Program</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center">Review</th>
                </tr>
              </thead>

              <tbody>
                {recentTasks.map((task) => (
                  <tr key={task._id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium">{task.title}</td>

                    <td className="px-5 py-4">{task.program?.title}</td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          task.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : task.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {task.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      {(task.status === "submitted" ||
                        task.status === "pending") &&
                      task.reviewStatus === "pending" ? (
                        <span className="text-yellow-600 font-medium">
                          Pending
                        </span>
                      ) : (
                        <span className="text-green-600 font-medium">
                          Reviewed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;
