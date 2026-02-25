import { useEffect, useState } from "react";
import { getMentorPrograms, getMentorTasks } from "../../api/mentor.api";
import StatCard from "../../components/ui/StatCard";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import ReviewTaskModal from "../../components/mentor/ReviewTaskModal";
import CreateTaskModal from "../../components/mentor/CreateTaskModal";

const priorityColors = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

const statusColors = {
  pending: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const MentorTasks = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [programs, setPrograms] = useState([]);

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const fetchTasks = async () => {
    try {
      const res = await getMentorTasks();
      setTasks(res.mentorTasks || []);
      setStats(res.stats || {});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMentorPrograms = async () => {
      try {
        const res = await getMentorPrograms();
        setPrograms(res.programs || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorPrograms();
    fetchTasks();
  }, [showCreateModal]);

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500">
        Loading mentor tasks...
      </div>
    );
  return (
    <div className="space-y-10">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-500 mt-1">
            Monitor intern progress and review submissions
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="
          cursor-pointer
          px-6 py-2.5
          bg-linear-to-r from-indigo-600 to-purple-600
          hover:opacity-90
          text-white
          rounded-xl
          font-medium
          shadow-md
        "
        >
          + Create Task
        </button>
      </div>

      {showCreateModal && (
        <CreateTaskModal
          programs={programs}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks || 0}
          icon={ClipboardList}
          color="bg-blue-600"
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
        <StatCard
          title="Rejected"
          value={stats.rejectedTasks || 0}
          icon={XCircle}
          color="bg-red-600"
        />
        <StatCard
          title="Late"
          value={stats.lateSubmissions || 0}
          icon={AlertTriangle}
          color="bg-orange-500"
        />
      </div>

      {/* ================= TASK LIST ================= */}
      <div className="space-y-5">
        {tasks.map((task) => (
          <div
            key={task._id}
            className="
            bg-white
            rounded-2xl
            shadow-sm
            border
            p-6
            hover:shadow-md
            transition
          "
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* LEFT */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {task.title}
                </h2>

                <p className="text-sm text-gray-500 max-w-2xl">
                  {task.description}
                </p>

                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="text-sm text-gray-600">
                    👤 {task.assignedIntern?.name}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}
                  >
                    Priority - {task.priority}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[task.status]}`}
                  >
                  Task Status - {task.status}
                  </span>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col  items-start sm:items-center gap-4 text-sm">
                <div className="text-gray-500">
                  <p>
                    <b>Deadline:</b> {new Date(task.deadline).toDateString()}
                  </p>
                  <p>
                    <b>Attempts:</b> {task.attempts}
                  </p>
                </div>

                {task.status === "submitted" &&
                task.reviewStatus !== "reviewed" ? (
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="
                    cursor-pointer
                    px-5 py-2
                    bg-indigo-600
                    hover:bg-indigo-700
                    text-white
                    rounded-lg
                    font-medium
                  "
                  >
                    Review
                  </button>
                ) : (
                  <span className="text-gray-400"></span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= REVIEW MODAL ================= */}
      {selectedTask && (
        <ReviewTaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          refresh={fetchTasks}
        />
      )}
    </div>
  );
};

export default MentorTasks;
