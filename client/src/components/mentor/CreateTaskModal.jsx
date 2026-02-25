import { useState } from "react";
import { X } from "lucide-react";
import { toastError, toastSuccess } from "../../utils/toast";
import { createTask } from "../../api/mentor.api";

const CreateTaskModal = ({ programs, onClose, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [deadlineError, setDeadlineError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    title: "",
    description: "",
    programId: "",
    internId: "",
    priority: "medium",
    deadline: "",
  });

  console.log(programs);
  const selectedProgram = programs.find((p) => p._id === form.programId);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Deadline validation
    if (name === "deadline") {
      if (value < today) {
        setDeadlineError("Deadline cannot be earlier than today");
      } else {
        setDeadlineError("");
      }
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.programId || !form.internId || !form.deadline) {
      return toastError("Please fill all required fields");
    }

    if (form.deadline < today) {
      return setDeadlineError("Deadline cannot be earlier than today");
    }

    try {
      setLoading(true);

      const res = await createTask(form);

      toastSuccess("Task created successfully");
      onCreated(res.task);
      onClose();
    } catch (err) {
      toastError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed min-h-screen inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6 space-y-6">
        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">Create Task</h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 cursor-pointer"
          >
            <X />
          </button>
        </div>

        {/* ================= FORM ================= */}
        <div className="space-y-5">
          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter task title"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
              focus:ring-2 focus:ring-indigo-300 outline-none"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              placeholder="Describe the task..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
              focus:ring-2 focus:ring-indigo-300 outline-none resize-none"
            />
          </div>

          {/* PROGRAM */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program <span className="text-red-500">*</span>
            </label>
            <select
              name="programId"
              value={form.programId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
              focus:ring-2 focus:ring-indigo-300 outline-none cursor-pointer"
            >
              <option value="">Select program</option>
              {programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* INTERN */}
          {selectedProgram && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intern <span className="text-red-500">*</span>
              </label>
              <select
                name="internId"
                value={form.internId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                focus:ring-2 focus:ring-indigo-300 outline-none cursor-pointer"
              >
                <option value="">Select intern</option>
                {selectedProgram?.interns?.length > 0 ? (
                  selectedProgram.interns.map((i) => (
                    <option key={i.intern._id} value={i.intern._id}>
                      {i.intern.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No interns enrolled</option>
                )}
              </select>
            </div>
          )}

          {/* PRIORITY */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
              focus:ring-2 focus:ring-indigo-300 outline-none cursor-pointer"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* DEADLINE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="deadline"
              min={today}
              value={form.deadline}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2.5 outline-none
              focus:ring-2 ${
                deadlineError
                  ? "border-red-500 ring-red-200"
                  : "border-gray-300 focus:ring-indigo-300"
              } cursor-pointer`}
            />

            {deadlineError && (
              <p className="text-red-500 text-xs mt-1">{deadlineError}</p>
            )}
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
