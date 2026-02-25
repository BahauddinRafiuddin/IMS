import { useEffect, useState } from "react";
import {
  createMentor,
  getAllMentors,
  deleteMentorById,
} from "../../api/admin.api";

import { toastError, toastSuccess } from "../../utils/toast";

import {
  User,
  Mail,
  Lock,
  X,
  Eye,
  EyeOff,
  SearchX,
  Users,
  Trash2,
} from "lucide-react";

import ConfirmModal from "../../components/common/ConfirmModal";

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allMentors, setAllMentors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [deleteMentor, setDeleteMentor] = useState(null);

  const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]{2,}@[a-z0-9.-]+\.[a-z]{2,}$/;
  const fullNameRegex = /^[A-Za-z ]{3,30}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const fetchMentors = async () => {
    try {
      const res = await getAllMentors();
      setAllMentors(res.mentors);
      setMentors(res.mentors);
    } catch (error) {
      toastError(error.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!search.trim()) {
      setMentors(allMentors);
      return;
    }

    const value = search.trim().toLowerCase();

    const filtered = allMentors.filter(
      (mentor) =>
        mentor.name.toLowerCase().includes(value) ||
        mentor.email.toLowerCase().includes(value),
    );

    setMentors(filtered);
  }, [search, allMentors]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    let err = {};

    if (!form.name.trim()) err.name = "Full name is required";
    else if (!fullNameRegex.test(form.name))
      err.name = "Only alphabets allowed";

    if (!emailRegex.test(form.email)) err.email = "Invalid email address";

    if (!passwordRegex.test(form.password))
      err.password = "Min 8 chars, 1 capital, 1 number, 1 symbol";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await createMentor(form);
      toastSuccess(res.message);
      setForm({ name: "", email: "", password: "" });
      setShowForm(false);
      fetchMentors();
    } catch (err) {
      toastError(err.response?.data?.message || "Mentor creation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    try {
      const res = await deleteMentorById(deleteMentor._id);
      toastSuccess(res.message);
      setDeleteMentor(null);
      fetchMentors();
    } catch (err) {
      toastError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-8">
      {/* ================= CONFIRM MODAL ================= */}
      {deleteMentor && (
        <ConfirmModal
          title="Delete Mentor"
          message={`Are you sure you want to delete mentor "${deleteMentor.name}"? This action cannot be undone.`}
          onCancel={() => setDeleteMentor(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Mentor Management
          </h1>
          <p className="text-gray-500 mt-1">Manage mentors and add interns</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <input
            placeholder="Search mentors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-72 px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium cursor-pointer whitespace-nowrap"
          >
            + Add Mentor
          </button>
        </div>
      </div>

      {/* ================= CREATE FORM ================= */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Create Mentor</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-red-500 cursor-pointer"
            >
              <X />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* NAME */}
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative mt-1">
                <User
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium">Email</label>
              <div className="relative mt-1">
                <Mail
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative mt-1">
                <Lock
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  minLength={8}
                  maxLength={8}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div className="md:col-span-3 flex justify-end mt-4">
              <button
                disabled={loading}
                type="submit"
                className={`px-10 py-2.5 rounded-xl font-medium transition cursor-pointer
    ${
      loading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700 text-white"
    }`}
              >
                Create Mentor
              </button>
            </div>
          </form>
        </div>
      )}
      {/* ================= EVERYTHING ELSE UNCHANGED ================= */}

      {/* ================= EMPTY STATE ================= */}
      {mentors.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-14 flex flex-col items-center justify-center text-center space-y-4">
          <SearchX className="w-20 h-20 text-blue-500 opacity-80" />
          <h2 className="text-xl font-semibold text-gray-800">
            No mentors found
          </h2>
          <p className="text-gray-500 max-w-md">
            We couldn’t find any mentors matching your search.
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden lg:block bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left">Mentor</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-center">Interns</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {mentors.map((mentor) => (
                  <tr key={mentor._id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{mentor.name}</td>
                    <td className="px-6 py-4 text-gray-600">{mentor.email}</td>
                    <td className="px-6 py-4 text-center font-semibold">
                      {mentor.internCount || 0}
                    </td>
                    <td className="px-6 py-4 flex justify-center items-center">
                      <Trash2
                        size={18}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                        onClick={() => setDeleteMentor(mentor)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:hidden">
            {mentors.map((mentor) => (
              <div
                key={mentor._id}
                className="bg-white rounded-2xl shadow p-5 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <h2 className="font-semibold text-lg">{mentor.name}</h2>

                  <Trash2
                    size={18}
                    className="text-red-500 cursor-pointer"
                    onClick={() => setDeleteMentor(mentor)}
                  />
                </div>

                <p className="text-gray-600 text-sm">{mentor.email}</p>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Users size={16} />
                    Interns
                  </span>

                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    {mentor.internCount || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Mentors;
