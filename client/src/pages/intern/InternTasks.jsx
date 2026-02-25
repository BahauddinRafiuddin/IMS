import { useEffect, useState } from "react";
import { getMyTasks } from "../../api/intern.api";
import {
  BookOpen,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
} from "lucide-react";
import SubmitTaskModal from "../../components/intern/SubmitTaskModal";
import { submitTask } from "../../api/intern.api";
import { toastSuccess, toastError } from "../../utils/toast";

const priorityColors = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

const statusColors = {
  pending: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  submitted: "bg-indigo-100 text-indigo-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const InternTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const res = await getMyTasks();
        setTasks(res.tasks || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTasks();
  }, []);

  const handleSubmitTask = async (data) => {
    try {
      await submitTask(selectedTask._id, data);
      toastSuccess("Task submitted successfully");

      setSelectedTask(null);

      // refresh list
      const res = await getMyTasks();
      setTasks(res.tasks || []);
    } catch (err) {
      toastError(err.response?.data?.message || "Submission failed");
    }
  };

  // console.log("task", tasks);
  if (loading)
    return (
      <div className="text-center py-20 text-gray-500">Loading tasks...</div>
    );

  if (!tasks.length)
    return (
      <div className="bg-white p-10 rounded-xl text-center shadow">
        <BookOpen className="mx-auto text-gray-400 mb-4" size={42} />
        <h2 className="text-xl font-semibold">No Tasks Assigned</h2>
        <p className="text-gray-500 mt-2">
          Your mentor has not assigned any tasks yet.
        </p>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
        <p className="text-gray-500 mt-1">View and manage all assigned tasks</p>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden lg:block bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-4 text-left">Task</th>
              <th className="px-5 py-4 text-left">Program</th>
              <th className="px-5 py-4 text-left">Mentor</th>
              <th className="px-5 py-4 text-center">Priority</th>
              <th className="px-5 py-4 text-center">Status</th>
              <th className="px-5 py-4 text-center">Deadline</th>
              <th className="px-5 py-4 text-center">Attempts</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => (
              <tr
                key={task._id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-5 py-4">
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.description}</p>
                </td>

                <td className="px-5 py-4">{task.program?.title}</td>

                <td className="px-5 py-4">{task.mentor?.name}</td>

                <td className="px-5 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                </td>

                <td className="px-5 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[task.status]}`}
                  >
                    {task.status.replace("_", " ").toUpperCase()}
                  </span>
                </td>

                <td className="px-5 py-4 text-center text-sm">
                  {new Date(task.deadline).toDateString()}
                </td>

                <td className="px-5 py-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {task.attempts}
                    </span>

                    {(task.status === "pending" ||
                      task.status === "rejected") && (
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="
          px-4 py-1.5
          text-xs
          rounded-md
          bg-blue-600
          hover:bg-blue-700
          text-white
          cursor-pointer
        "
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:hidden">
        {tasks.map((task) => (
          <div
            key={task._id}
            className="bg-white rounded-2xl shadow p-6 space-y-3"
          >
            <h2 className="text-lg font-bold">{task.title}</h2>

            <p className="text-sm text-gray-600">{task.description}</p>

            <div className="text-sm flex gap-2 items-center">
              <BookOpen size={16} />
              {task.program?.title}
            </div>

            <div className="text-sm flex gap-2 items-center">
              <User size={16} />
              {task.mentor?.name}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}
              >
                {task.priority}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[task.status]}`}
              >
                {task.status}
              </span>
            </div>

            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar size={16} />
              Due: {new Date(task.deadline).toDateString()}
            </div>

            <div className="pt-3 flex justify-between items-center border-t">
              <span className="text-sm text-gray-500">
                Attempts: {task.attempts}
              </span>

              {(task.status === "pending" || task.status === "rejected") && (
                <button
                  onClick={() => setSelectedTask(task)}
                  className="
        px-4 py-1.5
        text-sm
        bg-blue-600
        text-white
        rounded-lg
        hover:bg-blue-700
        cursor-pointer
      "
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <SubmitTaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSubmit={handleSubmitTask}
        />
      )}
    </div>
  );
};

export default InternTasks;
