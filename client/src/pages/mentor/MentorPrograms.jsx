import { useEffect, useState } from "react";
import { getMentorPrograms, completeInternship } from "../../api/mentor.api";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Briefcase,
  CheckCircle,
  IndianRupee,
} from "lucide-react";

const MentorPrograms = () => {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);

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
  }, []);
  // console.log(programs)
  // 🔥 Complete Internship Handler
  const handleComplete = async (enrollmentId) => {
    try {
      await completeInternship(enrollmentId);

      // Update UI instantly
      setPrograms((prev) =>
        prev.map((program) => ({
          ...program,
          interns: program.interns.map((enrollment) =>
            enrollment._id === enrollmentId
              ? { ...enrollment, status: "completed" }
              : enrollment,
          ),
        })),
      );

      alert("Internship marked as completed ✅");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">Loading programs...</div>
    );
  }

  if (!programs.length) {
    return (
      <div className="bg-white p-10 rounded-xl shadow text-center">
        <BookOpen className="mx-auto text-gray-400 mb-4" size={44} />
        <h2 className="text-xl font-semibold">No Programs Found</h2>
        <p className="text-gray-500 mt-2">
          You are not assigned to any internship program yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Programs</h1>
        <p className="text-gray-500 mt-1">
          Internship programs assigned to you
        </p>
      </div>

      {/* PROGRAM CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {programs.map((program) => (
          <div
            key={program._id}
            className="bg-white rounded-2xl shadow p-6 space-y-4 hover:shadow-lg transition"
          >
            {/* TITLE + STATUS */}
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold text-gray-800">
                {program.title}
              </h2>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold
                ${
                  program.status === "active"
                    ? "bg-green-100 text-green-700"
                    : program.status === "completed"
                      ? "bg-gray-200 text-gray-700"
                      : program.status === "upcoming"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                }`}
              >
                {program.status.toUpperCase()}
              </span>
            </div>

            {/* DESCRIPTION */}
            <p className="text-sm text-gray-600">{program.description}</p>

            {/* PROGRAM INFO */}
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                Domain: <b>{program.domain}</b>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={16} />
                Duration: <b>{program.durationInWeeks} weeks</b>
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {new Date(program.startDate).toDateString()} —{" "}
                {new Date(program.endDate).toDateString()}
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                Minimum Tasks Required: <b>{program.minimumTasksRequired}</b>
              </div>

              <div className="flex items-center gap-2">
                <Briefcase size={16} />
                Type: <b className="capitalize">{program.type}</b>
              </div>

              <div className="flex items-center gap-2">
                <IndianRupee size={16} />
                Price:{" "}
                <b>{program.type === "free" ? "Free" : `₹${program.price}`}</b>
              </div>

              <div className="flex items-center gap-2">
                <Users size={16} />
                Active: <b>{program.isActive ? "Yes" : "No"}</b>
              </div>
            </div>

            {/* 🔥 INTERN LIST (Enrollment Data) */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Assigned Interns
              </h3>

              {program.interns.length === 0 ? (
                <p className="text-xs text-gray-400">No interns assigned</p>
              ) : (
                <div className="space-y-3">
                  {program.interns.map((enrollment) => (
                    <div
                      key={enrollment._id}
                      className="bg-white border border-gray-100 hover:border-indigo-200 transition-all rounded-xl p-4 shadow-sm hover:shadow-md"
                    >
                      {/* Intern Header */}
                      <div className="flex items-center justify-between">
                        {/* Avatar + Name */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                            {enrollment.intern.name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {enrollment.intern.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {enrollment.intern.email}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full capitalize
          ${
            enrollment.status === "completed"
              ? "bg-green-100 text-green-700"
              : enrollment.status === "in_progress"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-600"
          }`}
                        >
                          {enrollment.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Action Section */}
                      <div className="mt-4">
                        {enrollment.status === "in_progress" && (
                          <button
                            onClick={() => handleComplete(enrollment._id)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg transition font-medium cursor-pointer"
                          >
                            Mark as Completed
                          </button>
                        )}

                        {enrollment.status === "completed" && (
                          <div className="text-green-600 text-sm font-semibold flex items-center gap-1">
                            <CheckCircle size={16} />
                            Internship Completed
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorPrograms;
