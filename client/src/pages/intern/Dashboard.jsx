import { useEffect, useState } from "react";
import StatCard from "../../components/ui/StatCard";
import { BookOpen, ClipboardList, CheckCircle, Clock } from "lucide-react";
import { getMyPerformance, getMyProgram } from "../../api/intern.api";
import { useNavigate } from "react-router-dom";

const InternDashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    programs: 0,
    totalTasks: 0,
    pendingTasks: 0,
    approvedTasks: 0,
  });

  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const myProgram = await getMyProgram();

        // ensure array
        const enrollments = myProgram.enrollement || [];

        // filter only valid programs
        const validEnrollments = enrollments.filter((e) => e.program !== null);

        setPrograms(validEnrollments);

        if (validEnrollments.length > 0) {
          const programId = validEnrollments[0].program._id;

          const myPerformance = await getMyPerformance(programId);

          setStats({
            programs: validEnrollments.length,
            totalTasks: myPerformance.performance.totalTasks,
            pendingTasks: myPerformance.performance.pendingTasks,
            approvedTasks: myPerformance.performance.approvedTasks,
          });
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // console.log(programs);
  if (!loading && programs.length === 0) {
    return (
      <div className="bg-white rounded-xl p-10 text-center">
        <h2 className="text-xl font-semibold">No active internship found</h2>
        <p className="text-gray-500 mt-2">Please contact admin</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Intern Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Track your progress, tasks and performance
        </p>
      </div>

      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Programs"
          value={stats.programs}
          icon={BookOpen}
          color="bg-indigo-600"
        />

        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={ClipboardList}
          color="bg-blue-600"
        />

        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={Clock}
          color="bg-yellow-500"
        />

        <StatCard
          title="Approved Tasks"
          value={stats.approvedTasks}
          icon={CheckCircle}
          color="bg-green-600"
        />
      </div>

      {/* ================= ACTIVE PROGRAMS ================= */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Active Program</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((enrollment) => (
            <div
              key={enrollment._id}
              className="bg-white rounded-2xl shadow p-6 space-y-3 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-bold text-gray-800">
                {enrollment.program?.title}
              </h3>

              <p className="text-sm text-gray-600">
                Domain: {enrollment.program?.domain}
              </p>

              <p className="text-sm text-gray-600">
                Mentor: {enrollment.mentor?.name}
              </p>

              <p className="text-sm text-gray-600">
                Duration: {enrollment.program?.durationInWeeks} weeks
              </p>

              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                {enrollment.status}
              </span>

              <div className="pt-3">
                <button
                  onClick={() => navigate("/intern/myProgram")}
                  className="text-blue-600 font-medium hover:underline cursor-pointer"
                >
                  View Program →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => navigate("/intern/tasks")}
            className="bg-white rounded-xl shadow p-6 text-left hover:shadow-lg transition cursor-pointer"
          >
            <p className="text-lg font-semibold">📋 View My Tasks</p>
            <p className="text-sm text-gray-500 mt-1">
              Check assigned and pending tasks
            </p>
          </button>

          <button
            onClick={() => navigate("/intern/performance")}
            className="bg-white rounded-xl shadow p-6 text-left hover:shadow-lg transition cursor-pointer"
          >
            <p className="text-lg font-semibold">📊 My Performance</p>
            <p className="text-sm text-gray-500 mt-1">
              Track your internship progress
            </p>
          </button>

          <button
            onClick={() => navigate("/intern/certificate")}
            className="bg-white rounded-xl shadow p-6 text-left hover:shadow-lg transition cursor-pointer"
          >
            <p className="text-lg font-semibold">🎓 Certificate Status</p>
            <p className="text-sm text-gray-500 mt-1">
              View eligibility and download certificate
            </p>
          </button>

          {/* ✅ NEW PAYMENT BUTTON */}
          <button
            onClick={() => navigate("/intern/payments")}
            className="bg-white rounded-xl shadow p-6 text-left hover:shadow-lg transition cursor-pointer"
          >
            <p className="text-lg font-semibold">💳 Payment History</p>
            <p className="text-sm text-gray-500 mt-1">
              View your payment records
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternDashboard;
