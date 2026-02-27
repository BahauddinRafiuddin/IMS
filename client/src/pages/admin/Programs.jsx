import { useEffect, useState, useMemo } from "react";
import { getAllPrograms, changeProgramStatus } from "../../api/program.api";
import { SearchX } from "lucide-react";

import ProgramStatusBadge from "../../components/program/ProgramStatusBadge";
import EnrollInternModal from "../../components/program/EnrollInternModal";
import CreateProgramModal from "../../components/program/CreateProgramModal";
import UpdateProgramModal from "../../components/program/UpdateProgramModal";

import { toastError, toastSuccess } from "../../utils/toast";
import ConfirmModal from "../../components/common/ConfirmModal";

const Programs = () => {
  const [confirmData, setConfirmData] = useState(null);
  const [programs, setPrograms] = useState([]);
  // const [allPrograms, setAllPrograms] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editProgram, setEditProgram] = useState(null);

  // ================= FETCH =================
  // ================= FETCH =================
  const fetchPrograms = async () => {
    try {
      const res = await getAllPrograms();
      setPrograms(res.programs);
    } catch (err) {
      toastError(err.response?.data?.message);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPrograms();
  }, []);

  // ================= STATUS CHANGE =================
  const handleStatusChange = async (program) => {
    let nextStatus = "active";

    if (program.status === "upcoming") nextStatus = "active";
    else if (program.status === "active") nextStatus = "completed";

    if (nextStatus === "completed" && program.totalTasks < 10) {
      toastError("Program must have at least 10 tasks before completing.");
      return;
    }
    try {
      await changeProgramStatus(program._id, nextStatus);
      toastSuccess(`Program marked as ${nextStatus}`);
      fetchPrograms();
    } catch (err) {
      toastError(err.response?.data?.message || "Status update failed");
    }
  };

  // ================= SEARCH =================
  const filteredPrograms = useMemo(() => {
    if (!search.trim()) return programs;

    const value = search.trim().toLowerCase();

    return programs.filter(
      (p) =>
        p.title.toLowerCase().includes(value) ||
        p.domain.toLowerCase().includes(value) ||
        p.mentor?.name?.toLowerCase().includes(value) ||
        p.status.toLowerCase().includes(value),
    );
  }, [search, programs]);

  // console.log("programs", programs);
  return (
    <div className="space-y-8">
      {/* ================= MODALS ================= */}
      {showCreate && (
        <CreateProgramModal
          onClose={() => setShowCreate(false)}
          refresh={fetchPrograms}
        />
      )}

      {selectedProgram && (
        <EnrollInternModal
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
          refresh={fetchPrograms}
        />
      )}

      {editProgram && (
        <UpdateProgramModal
          program={editProgram}
          onClose={() => setEditProgram(null)}
          refresh={fetchPrograms}
        />
      )}

      {confirmData && (
        <ConfirmModal
          title="Confirm Program Status"
          message={`Are you sure you want to mark "${confirmData.program.title}" as "${confirmData.nextStatus}"? This action cannot be undone.`}
          onCancel={() => setConfirmData(null)}
          onConfirm={() => {
            handleStatusChange(confirmData.program);
            setConfirmData(null);
          }}
        />
      )}

      {/* ================= HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Internship Programs
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage internship lifecycle and interns
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, domain, mentor or status..."
            className="
              w-full sm:w-80 px-4 py-2 rounded-xl border
              focus:ring-2 focus:ring-blue-500 outline-none
            "
          />

          <button
            onClick={() => setShowCreate(true)}
            className="
              cursor-pointer
              bg-linear-to-r from-blue-600 to-indigo-600
              hover:opacity-90
              text-white px-6 py-2.5 rounded-xl
              font-medium shadow
            "
          >
            + Create Program
          </button>
        </div>
      </div>

      {/* ================= EMPTY ================= */}
      {filteredPrograms.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-14 flex flex-col items-center text-center space-y-4">
          <SearchX className="w-20 h-20 text-blue-500 opacity-70" />

          <h2 className="text-xl font-semibold text-gray-800">
            No programs found
          </h2>

          <p className="text-gray-500 max-w-md">
            Try adjusting your search or clear the filter.
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
        <div className="space-y-4">
          {filteredPrograms.map((program) => (
            <div
              key={program._id}
              className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition"
            >
              <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                {/* LEFT SECTION */}
                <div className="space-y-3 flex-1">
                  {/* TITLE + STATUS */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {program.title}
                    </h2>

                    <ProgramStatusBadge status={program.status} />
                  </div>

                  {/* DESCRIPTION */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {program.description}
                  </p>

                  {/* META INFO GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 mt-3">
                    <div>
                      📘 <b>Domain:</b> {program.domain}
                    </div>

                    <div>
                      👨‍🏫 <b>Mentor:</b> {program.mentor?.name || "—"}
                    </div>

                    <div>
                      ⏳ <b>Duration:</b> {program.durationInWeeks} weeks
                    </div>

                    <div>
                      📅 <b>Dates:</b>{" "}
                      {new Date(program.startDate).toDateString()} —{" "}
                      {new Date(program.endDate).toDateString()}
                    </div>

                    <div>
                      📌 <b>Minimum Tasks:</b> {program.minimumTasksRequired}
                    </div>

                    <div>
                      💼 <b>Type:</b>{" "}
                      <span className="capitalize font-medium">
                        {program.type}
                      </span>
                    </div>

                    <div>
                      💰 <b>Price:</b>{" "}
                      {program.type === "free" ? "Free" : `₹${program.price}`}
                    </div>

                    <div>
                      🟢 <b>Active:</b> {program.isActive ? "Yes" : "No"}
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-wrap items-center gap-3">
                  {program.status === "upcoming" && (
                    <button
                      onClick={() => setSelectedProgram(program)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                    >
                      Enroll
                    </button>
                  )}

                  {program.status !== "completed" && (
                    <button
                      disabled={
                        program.status === "active" &&
                        program.minimumTasksRequired > 0 &&
                        program.totalTasks < program.minimumTasksRequired
                      }
                      onClick={() =>
                        setConfirmData({
                          program,
                          nextStatus:
                            program.status === "upcoming"
                              ? "active"
                              : "completed",
                        })
                      }
                      className={`px-4 py-2 rounded-lg text-white ${
                        program.status === "upcoming"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {program.status === "upcoming" ? "Activate" : "Complete"}
                    </button>
                  )}

                  {program.status !== "completed" && (
                    <button
                      onClick={() => setEditProgram(program)}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Programs;
