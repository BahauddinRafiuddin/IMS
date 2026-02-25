import { useState } from "react";
import { updateProgram } from "../../api/program.api";
import { toastError, toastSuccess } from "../../utils/toast";

const domains = [
  "Backend Development",
  "Frontend Development",
  "Web Development",
  "AI / ML",
  "Data Science",
  "Mobile App Development",
];

const UpdateProgramModal = ({ program, onClose, refresh }) => {
  const [loading, setLoading] = useState(false);
  const [durationInweek, setDurationInWeek] = useState(program.durationInWeeks);

  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: program.title || "",
    domain: program.domain || "",
    description: program.description || "",
    rules: program.rules || "",
    startDate: program.startDate?.slice(0, 10) || "",
    endDate: program.endDate?.slice(0, 10) || "",
  });

   const getMinEndDate = () => {
    if (!form.startDate) return today;

    const start = new Date(form.startDate);
    start.setDate(start.getDate() + 7);

    return start.toISOString().split("T")[0];
  };

  // ================= DURATION =================
  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const diffTime = endDate - startDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays < 7) {
      toastError("Duration must be minimum one week");
      return 0;
    }

    return Math.ceil(diffDays / 7);
  };

  // ================= VALIDATION =================
  const validate = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    else if (form.title.length < 5)
      newErrors.title = "Minimum 5 characters required";
    else if (form.title.length > 100)
      newErrors.title = "Maximum 100 characters allowed";

    if (!form.domain) newErrors.domain = "Domain is required";

    if (!form.startDate) newErrors.startDate = "Start date is required";

    if (!form.endDate) newErrors.endDate = "End date is required";

    if (!form.description.trim())
      newErrors.description = "Description is required";
    else if (form.description.length < 10)
      newErrors.description = "Minimum 10 characters required";
    else if (form.description.length > 500)
      newErrors.description = "Maximum 500 characters allowed";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ================= CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedForm = {
      ...form,
      [name]: value,
    };

    if (
      (name === "startDate" || name === "endDate") &&
      updatedForm.startDate &&
      updatedForm.endDate
    ) {
      if (new Date(updatedForm.endDate) <= new Date(updatedForm.startDate)) {
        toastError("End date must be after start date");
        return;
      }

      const weeks = calculateDuration(
        updatedForm.startDate,
        updatedForm.endDate,
      );

      if (weeks > 0) {
        setDurationInWeek(weeks);
        updatedForm.durationInWeeks = weeks;
      }
    }

    setForm(updatedForm);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      const res = await updateProgram(program._id, form);
      toastSuccess(res.message);
      refresh();
      onClose();
    } catch (err) {
      toastError(err.response?.data?.message || "Failed to update program");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="
      bg-white
      w-full max-w-3xl
      rounded-2xl
      shadow-xl
      max-h-[90vh]
      flex flex-col
    "
      >
        {/* HEADER */}
        <div className="px-6 sm:px-8 py-5 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Update Program</h2>
        </div>

        <div className="px-6 sm:px-8 py-6 space-y-6 overflow-y-auto">
          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* TITLE */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Program Title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 ring-blue-500 outline-none"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* DOMAIN */}
            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <select
                name="domain"
                value={form.domain}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">Select domain</option>
                {domains.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              {errors.domain && (
                <p className="text-red-500 text-xs mt-1">{errors.domain}</p>
              )}
            </div>

            {/* START DATE */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                min={today}
                value={form.startDate}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
              />
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
              )}
            </div>

            {/* END DATE */}
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                min={getMinEndDate()}
                value={form.endDate}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
              />
              {errors.endDate && (
                <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
              )}
            </div>

            {/* DURATION */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (weeks)
              </label>
              <input
                value={durationInweek}
                readOnly
                className="w-full bg-gray-100 border rounded-lg px-4 py-2 cursor-not-allowed"
              />
            </div>
          </div>

          {/* RULES */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Internship Rules (optional)
            </label>
            <textarea
              name="rules"
              value={form.rules}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Program Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-lg px-4 py-2"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>
        </div>

        {/* FOOTER  */}
        <div className="px-6 sm:px-8 py-4 border-t flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="border px-5 py-2 rounded-lg cursor-pointer"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Program"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProgramModal;
