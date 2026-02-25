import { useState } from "react";
import { X, Star } from "lucide-react";
import { toastError, toastSuccess } from "../../utils/toast";
import { reviewTask } from "../../api/mentor.api";

const ReviewTaskModal = ({ task, onClose, refresh }) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    status: "approved",
    score: "",
    feedback: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.score === "" || form.score < 0 || form.score > 10) {
      return toastError("Score must be between 0 and 10");
    }

    try {
      setLoading(true);

      const res = await reviewTask(task._id, {
        status: form.status,
        score: Number(form.score),
        feedback: form.feedback,
      });
      console.log("res", res);
      toastSuccess("Task reviewed successfully");

      await refresh();
      onClose();
    } catch (error) {
      console.log(error);
      toastError(error.response?.data?.message || "Failed to review task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-2 sm:px-4">
      <form className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Review Task
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-200 cursor-pointer"
          >
            <X />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TASK INFO */}
          <div className="bg-gray-50 border rounded-xl p-4 space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-800">Task</p>
              <p className="text-gray-700">{task.title}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">Description</p>
              <p className="text-gray-600 leading-relaxed">
                {task.description}
              </p>
            </div>

            <hr />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <p>
                <span className="font-semibold">Intern:</span>{" "}
                {task.assignedIntern?.name}
              </p>

              <p className="break-all">
                <span className="font-semibold">Email:</span>{" "}
                {task.assignedIntern?.email}
              </p>
            </div>

            <hr />

            {/* SUBMISSION LINK */}
            {task.submissionLink && (
              <div>
                <p className="font-semibold">Submission Link</p>
                <a
                  href={task.submissionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all hover:text-blue-800"
                >
                  {task.submissionLink}
                </a>
              </div>
            )}

            {/* SUBMISSION TEXT */}
            {task.submissionText && (
              <div>
                <p className="font-semibold mb-1">Submission Text</p>
                <div className="bg-white border rounded-lg p-3 text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {task.submissionText}
                </div>
              </div>
            )}

            {/* SUBMISSION FILE */}
            {task.submissionFile && (
              <div>
                <p className="font-semibold">Submission File</p>
                <a
                  href={task.submissionFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 text-green-600 underline hover:text-green-800"
                >
                  View / Download File
                </a>
              </div>
            )}
          </div>

          {/* ================= REVIEW ================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* STATUS */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Review Decision
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full cursor-pointer focus:ring-2 focus:ring-blue-500"
              >
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
              </select>
            </div>

            {/* SCORE */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Score (0–10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                name="score"
                value={form.score}
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500"
                placeholder="Enter score"
              />
            </div>
          </div>

          {/* FEEDBACK */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Feedback (optional)
            </label>
            <textarea
              rows="4"
              name="feedback"
              value={form.feedback}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 w-full resize-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write feedback..."
            />
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border rounded-lg hover:bg-gray-200 cursor-pointer"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={!loading ? handleSubmit : undefined}
            type="button"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewTaskModal;
