import { useEffect, useState } from "react";
import { createProgram } from "../../api/program.api";
import { getAllMentors } from "../../api/admin.api";
import { toastError, toastSuccess } from "../../utils/toast";

const domains = [
  "Backend Development",
  "Frontend Development",
  "Web Development",
  "AI / ML",
  "Data Science",
  "Mobile App Development",
];

const CreateProgram = ({ onClose, refresh }) => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: "",
    domain: "",
    description: "",
    mentor: "",
    durationInWeeks: "",
    minimumTasksRequired:"",
    startDate: "",
    endDate: "",
    type: "free",
    price: 0,
    rules: "",
  });

  const today = new Date().toISOString().split("T")[0];

  // ================= LOAD MENTORS =================
  useEffect(() => {
    const loadMentors = async () => {
      try {
        const res = await getAllMentors();
        setMentors(res.mentors);
      } catch {
        toastError("Failed to load mentors");
      }
    };

    loadMentors();
  }, []);

  // ================= CALCULATE DURATION =================
  const calculateDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffDays = (e - s) / (1000 * 60 * 60 * 24);

    if (diffDays < 7) {
      toastError("Minimum program duration is 1 week");
      return 0;
    }

    return Math.ceil(diffDays / 7);
  };

  const getMinEndDate = () => {
    if (!form.startDate) return today;
    const start = new Date(form.startDate);
    start.setDate(start.getDate() + 7);
    return start.toISOString().split("T")[0];
  };

  // ================= VALIDATION =================
  const validate = () => {
    const err = {};

    if (!form.title.trim()) err.title = "Program title is required";
    if (!form.domain) err.domain = "Domain is required";
    if (!form.mentor) err.mentor = "Mentor selection is required";
    if (!form.minimumTasksRequired) err.minimumTasksRequired = "Specify MinimumTasks it is required";
    if(form.minimumTasksRequired>30) err.minimumTasksRequired="Not More Than 30"
    if (!form.startDate) err.startDate = "Start date is required";
    if (!form.endDate) err.endDate = "End date is required";
    if (!form.description.trim()) err.description = "Description is required";
    if (!form.rules.trim()) err.rules = "Rules are required";

    if (form.type === "paid" && (!form.price || form.price <= 0)) {
      err.price = "Price must be greater than 0";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ================= CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    let updated = { ...form, [name]: value };

    if (
      (name === "startDate" || name === "endDate") &&
      updated.startDate &&
      updated.endDate
    ) {
      if (new Date(updated.endDate) <= new Date(updated.startDate)) {
        toastError("End date must be after start date");
        return;
      }

      const weeks = calculateDuration(updated.startDate, updated.endDate);

      if (weeks > 0) updated.durationInWeeks = weeks;
    }

    if (name === "type" && value === "free") {
      updated.price = 0;
    }

    setForm(updated);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await createProgram(form);
      toastSuccess("Program created successfully");
      refresh();
      onClose();
    } catch (err) {
      toastError(err.response?.data?.message || "Failed to create program");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-3xl rounded-2xl shadow-xl max-h-[90vh] flex flex-col"
      >
        <div className="px-6 py-5 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Create Internship Program
          </h2>
        </div>

        <div className="px-6 py-6 space-y-6 overflow-y-auto">
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
                className="w-full border rounded-lg px-4 py-2"
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

            {/* MENTOR */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Assign Mentor
              </label>
              <select
                name="mentor"
                value={form.mentor}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">Select mentor</option>
                {mentors.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {errors.mentor && (
                <p className="text-red-500 text-xs mt-1">{errors.mentor}</p>
              )}
            </div>

            {/* TYPE */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Program Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {/* PRICE */}
            {form.type === "paid" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2"
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>
            )}

            {/* Minimum Task */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Task
              </label>
              <input
                type="number"
                name="minimumTasksRequired"
                value={form.minimumTasksRequired}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
              />
              {errors.minimumTasksRequired && (
                <p className="text-red-500 text-xs mt-1">{errors.minimumTasksRequired}</p>
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
                value={form.durationInWeeks}
                readOnly
                className="w-full bg-gray-100 border rounded-lg px-4 py-2"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              rows={3}
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* RULES */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Program Rules
            </label>
            <textarea
              rows={3}
              name="rules"
              value={form.rules}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
            {errors.rules && (
              <p className="text-red-500 text-xs mt-1">{errors.rules}</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="border px-5 py-2 rounded-lg cursor-pointer"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer"
          >
            {loading ? "Creating..." : "Create Program"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProgram;
