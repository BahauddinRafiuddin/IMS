import { useEffect, useState } from "react";
import {
  createIntern,
  getAllInterns,
  updateInternStatus,
} from "../../api/admin.api";
import { toastError, toastSuccess } from "../../utils/toast";
import { User, Mail, Lock, X, Eye, EyeOff, SearchX } from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import TableExportButtons from "../../components/common/TableExportButtons";
import Pagination from "../../components/common/Pagination";

const Interns = () => {
  const [interns, setInterns] = useState([]);

  const [search, setSearch] = useState("");
  const [allInterns, setAllInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [toggleStatus, setToggleStatus] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 5;

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]{2,}@[a-z0-9.-]+\.[a-z]{2,}$/;
  const fullNameRegex = /^[A-Za-z ]{3,30}$/;

  const fetchData = async () => {
    try {
      const internRes = await getAllInterns();
      setAllInterns(internRes.interns);
      setInterns(internRes.interns);
    } catch (err) {
      console.log(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusToggle = async (id, status) => {
    try {
      const res = await updateInternStatus(id, status);
      toastSuccess(res.message);
      setToggleStatus(null);
      fetchData();
    } catch (err) {
      toastError(err.response?.data?.message);
    }
  };

  // ================= SEARCH =================
  useEffect(() => {
    if (!search.trim()) {
      setInterns(allInterns);
      return;
    }

    const value = search.trim().toLowerCase();

    const filtered = allInterns.filter(
      (intern) =>
        intern.name.toLowerCase().includes(value) ||
        intern.email.toLowerCase().includes(value),
    );

    setInterns(filtered);
  }, [search, allInterns]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Pagination logic
  const start = (page - 1) * limit;
  const paginatedInterns = interns.slice(start, start + limit);
  const totalPages = Math.ceil(interns.length / limit);

  const validate = () => {
    let err = {};

    if (!form.name.trim()) err.name = "Full name is required";
    else if (!fullNameRegex.test(form.name))
      err.name = "Only alphabets allowed";

    if (!emailRegex.test(form.email)) err.email = "Invalid email address";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await createIntern(form);
      toastSuccess(res.message);
      setForm({ name: "", email: "", password: "" });
      setShowForm(false);
      fetchData();
    } catch (err) {
      toastError(err.response?.data?.message || "Mentor creation failed");
    } finally {
      setLoading(false);
    }
  };

  // if (loading)
  //   return (
  //     <div className="py-20 text-center text-gray-500">Loading interns...</div>
  //   );

  // ================= EXPORT DATA =================
  const exportData = interns.map((i) => ({
    Name: i.name,
    Email: i.email,
    Status: i.isActive ? "Active" : "Inactive",
    Mentor: i.mentor?.name || "Not assigned",
  }));

  const columns = ["Name", "Email", "Status", "Mentor"];
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-8">
      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Intern Management
          </h1>
          <p className="text-gray-500 mt-1">Manage intern and add intern</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
          {/* SEARCH */}
          <input
            placeholder="Search interns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-72 px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3">
            <TableExportButtons
              data={exportData}
              columns={columns}
              fileName="interns"
            />

            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium cursor-pointer whitespace-nowrap"
            >
              + Add Intern
            </button>
          </div>
        </div>
      </div>
      {/* ================= CREATE FORM ================= */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Create Intern</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-red-500 cursor-pointer"
            >
              <X />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
                Create Intern
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= EMPTY ================= */}
      {interns.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-14 flex flex-col items-center text-center space-y-4">
          <SearchX className="w-20 h-20 text-blue-500 opacity-70" />
          <h2 className="text-xl font-semibold">No interns found</h2>
          <p className="text-gray-500 max-w-md">
            Try adjusting your search keywords.
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
          {/* ================= TABLE ================= */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-225">
                {/* HEADER */}
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                      Intern
                    </th>

                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                      Email
                    </th>

                    <th className="px-4 md:px-6 py-3 md:py-4 text-center text-sm font-semibold text-gray-700 whitespace-nowrap">
                      Status
                    </th>

                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                      Mentor
                    </th>

                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                      Internship Status
                    </th>

                    <th className="px-4 md:px-6 py-3 md:py-4 text-center text-sm font-semibold text-gray-700 whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody className="divide-y">
                  {paginatedInterns.map((intern) => (
                    <tr
                      key={intern._id}
                      className="hover:bg-gray-50 transition"
                    >
                      {/* INTERN NAME */}
                      <td className="px-4 md:px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                        {intern.name}
                      </td>

                      {/* EMAIL */}
                      <td className="px-4 md:px-6 py-4 text-gray-600 whitespace-nowrap">
                        {intern.email}
                      </td>

                      {/* ACTIVE STATUS */}
                      <td className="px-4 md:px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            intern.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {intern.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* MENTOR */}
                      <td className="px-4 md:px-6 py-4 text-gray-700 whitespace-nowrap">
                        {intern.mentor?.name || (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </td>

                      {/* INTERNSHIP STATUS */}
                      <td className="px-4 md:px-6 py-4">
                        {intern.enrollmentStatus === "approved" && (
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                            Starting Soon
                          </span>
                        )}

                        {intern.enrollmentStatus === "in_progress" && (
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                            In Progress
                          </span>
                        )}

                        {intern.enrollmentStatus === "completed" && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                            Completed
                          </span>
                        )}

                        {intern.enrollmentStatus === "cancelled" && (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                            Cancelled
                          </span>
                        )}

                        {!intern.enrollmentStatus && (
                          <span className="text-gray-400 text-sm">
                            Not enrolled
                          </span>
                        )}
                      </td>

                      {/* ACTION */}
                      <td className="px-4 md:px-6 py-4 text-center">
                        <button
                          onClick={() => setToggleStatus(intern)}
                          className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition ${
                            intern.isActive
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                        >
                          {intern.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* ================= PAGINATION ================= */}
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </>
      )}

      {toggleStatus && (
        <ConfirmModal
          title="Change Intern Status"
          message={`Are you sure you want to ${
            toggleStatus.isActive ? "deactivate" : "activate"
          } this intern?`}
          onCancel={() => setToggleStatus(null)}
          onConfirm={() =>
            handleStatusToggle(toggleStatus._id, !toggleStatus.isActive)
          }
        />
      )}
    </div>
  );
};

export default Interns;
