import { useEffect, useState } from "react";
import { getMyProgram, startInternship } from "../../api/intern.api";
import { Calendar, Clock, User, Mail, Users, BookOpen } from "lucide-react";
import { toastError, toastSuccess } from "../../utils/toast";
import { initiatePayment } from "../../services/razorpay.service";

const statusColor = {
  upcoming: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
};

const InternPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load My program
  const fetchPrograms = async () => {
    try {
      const res = await getMyProgram();
      setPrograms(res.enrollement || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPrograms();
  }, []);

  // Start InternShip
  const handleStart = async (enrollmentId) => {
    try {
      const res = await startInternship(enrollmentId);
      toastSuccess(res.message);

      // Update UI immediately without reload
      setPrograms((prev) =>
        prev.map((p) =>
          p._id === enrollmentId ? { ...p, status: "in_progress" } : p,
        ),
      );
    } catch (err) {
      toastError(err.response?.data?.message);
    }
  };

  if (loading)
    return <div className="text-center py-20">Loading programs...</div>;

  if (!programs.length)
    return (
      <div className="bg-white p-10 rounded-xl text-center shadow">
        <BookOpen className="mx-auto text-gray-400 mb-4" size={40} />
        <h2 className="text-xl font-semibold">No Programs Found</h2>
        <p className="text-gray-500 mt-2">
          You are not enrolled in any program yet.
        </p>
      </div>
    );
// console.log(programs)
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">
        My Internship Programs
      </h1>
      {programs && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {programs?.map((enrollment) => {
            const program = enrollment.program;

            return (
              <div
                key={enrollment._id}
                className="bg-white rounded-2xl shadow p-6 space-y-5 hover:shadow-lg transition"
              >
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-800">
                    {program.title}
                  </h2>

                  <span
                    className={`px-4 py-1 rounded-full text-sm font-semibold ${
                      statusColor[program.status]
                    }`}
                  >
                    {program.status}
                  </span>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {program.description}
                </p>

                {/* INFO GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} />
                    Domain: {program.domain}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    Duration: {program.durationInWeeks} weeks
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(program.startDate).toDateString()} →{" "}
                    {new Date(program.endDate).toDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium">Type:</span> {program.type}
                  </div>
                </div>

                {/* MENTOR */}
                <div className="border-t pt-4 space-y-2">
                  <h3 className="font-semibold text-gray-800">
                    Assigned Mentor
                  </h3>

                  <div className="flex items-center gap-3 text-sm">
                    <User size={16} />
                    {enrollment.mentor.name}
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={16} />
                    {enrollment.mentor.email}
                  </div>
                </div>

                {/* ENROLLMENT INFO */}
                <div className="border-t pt-4 flex flex-col sm:flex-row sm:justify-between text-xs text-gray-500 gap-2">
                  <span>
                    Enrollment Status:{" "}
                    <b className="capitalize">{enrollment.status}</b>
                  </span>

                  <span>
                    Enrolled On:{" "}
                    {new Date(enrollment.enrolledAt).toDateString()}
                  </span>
                </div>

                {/* ACTION BUTTON */}
                <div className="pt-4">
                  {/* FREE PROGRAM */}
                  {enrollment.status === "approved" &&
                    program.type === "free" && (
                      <button
                        onClick={() => handleStart(enrollment._id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-medium transition cursor-pointer"
                      >
                        Start Internship
                      </button>
                    )}

                  {/* PAID PROGRAM - NOT PAID */}
                  {enrollment.status === "approved" &&
                    program.type === "paid" &&
                    enrollment.paymentStatus !== "paid" && (
                      <button
                        onClick={() =>
                          initiatePayment({
                            enrollment,
                            onSuccess: () => {
                              toastSuccess("Payment successful!");
                              fetchPrograms();
                            },
                            onFailure: (msg) => {
                              toastError(msg);
                            },
                          })
                        }
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-medium transition cursor-pointer"
                      >
                        Pay Now ₹{program.price}
                      </button>
                    )}

                  {/* PAID PROGRAM - PAID */}
                  {enrollment.status === "approved" &&
                    program.type === "paid" &&
                    enrollment.paymentStatus === "paid" && (
                      <button
                        onClick={() => handleStart(enrollment._id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-medium transition cursor-pointer"
                      >
                        Start Internship
                      </button>
                    )}

                  {/* IN PROGRESS */}
                  {enrollment.status === "in_progress" && (
                    <button
                      disabled
                      className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium cursor-not-allowed"
                    >
                      Internship In Progress
                    </button>
                  )}

                  {/* COMPLETED */}
                  {enrollment.status === "completed" && (
                    <button
                      disabled
                      className="w-full bg-gray-600 text-white py-2.5 rounded-xl font-medium cursor-not-allowed"
                    >
                      Internship Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InternPrograms;
