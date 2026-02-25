import { useEffect, useState } from "react";
import { getInternPerformance } from "../../api/mentor.api";
import {
  User,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Star,
} from "lucide-react";

const InternPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [interns, setInterns] = useState([]);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await getInternPerformance();
        setInterns(res.interns || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading intern performance...
      </div>
    );
  }

  if (!interns.length) {
    return (
      <div className="bg-white p-10 rounded-xl text-center shadow">
        <User className="mx-auto text-gray-400 mb-4" size={40} />
        <h2 className="text-xl font-semibold">No Intern Data</h2>
        <p className="text-gray-500 mt-2">
          No performance records available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Intern Performance</h1>
        <p className="text-gray-500 mt-1">
          Track intern progress, scores and task completion
        </p>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden lg:block bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-4 text-left">Intern</th>
              <th className="px-5 py-4 text-left">Program</th>
              <th className="px-5 py-4 text-center">Tasks</th>
              <th className="px-5 py-4 text-center">Approved</th>
              <th className="px-5 py-4 text-center">Rejected</th>
              <th className="px-5 py-4 text-center">Avg Score</th>
              <th className="px-5 py-4 text-center">Completion</th>
              <th className="px-5 py-4 text-center">Grade</th>
            </tr>
          </thead>

          <tbody>
            {interns.map((item) => (
              <tr
                key={item.intern._id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-5 py-4">
                  <p className="font-semibold">{item.intern.name}</p>
                  <p className="text-sm text-gray-500">{item.intern.email}</p>
                </td>

                <td className="px-5 py-4">{item.program?.title || "—"}</td>

                <td className="px-5 py-4 text-center">{item.totalTasks}</td>

                <td className="px-5 py-4 text-center text-green-600">
                  {item.approved}
                </td>

                <td className="px-5 py-4 text-center text-red-600">
                  {item.rejected}
                </td>

                <td className="px-5 py-4 text-center font-semibold">
                  {item.averageScore}/10
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm">{item.completion}%</span>
                    <div className="w-24 bg-gray-200 h-2 rounded-full">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.completion}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-center">
                  {item.grade === "Excellent" && (
                    <span className="text-green-600 font-semibold flex items-center justify-center gap-1">
                      <Star size={16} /> Excellent
                    </span>
                  )}
                  {item.grade === "Good" && (
                    <span className="text-yellow-600 font-semibold">Good</span>
                  )}
                  {item.grade === "Poor" && (
                    <span className="text-red-600 font-semibold">Poor</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:hidden">
        {interns.map((item) => (
          <div
            key={item.intern._id}
            className="bg-white rounded-2xl shadow p-6 space-y-3"
          >
            <h2 className="text-lg font-bold">{item.intern.name}</h2>
            <p className="text-sm text-gray-500">{item.intern.email}</p>

            <p className="text-sm">
              <b>Program:</b> {item.program?.title}
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <p>Tasks: {item.totalTasks}</p>
              <p className="text-green-600">Approved: {item.approved}</p>
              <p className="text-red-600">Rejected: {item.rejected}</p>
              <p>Score: {item.averageScore}/10</p>
            </div>

            <div>
              <p className="text-sm mb-1">Completion: {item.completion}%</p>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${item.completion}%` }}
                />
              </div>
            </div>

            <div className="pt-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.grade === "Excellent"
                    ? "bg-green-100 text-green-700"
                    : item.grade === "Good"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {item.grade}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InternPerformance;
