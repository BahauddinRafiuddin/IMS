import { useEffect, useState } from "react";
import { getMentorInterns } from "../../api/mentor.api";
import { Users, Mail, Calendar, BookOpen } from "lucide-react";

const MentorInterns = () => {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    const fetchMentorInterns = async () => {
      try {
        const res = await getMentorInterns();
        const interns = res.interns || [];
        const validInterns = interns.filter((e) => e.program !== null);
        setEnrollments(validInterns || res || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorInterns();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">Loading interns...</div>
    );
  }

  if (!enrollments.length) {
    return (
      <div className="bg-white p-10 rounded-xl shadow text-center">
        <Users className="mx-auto text-gray-400 mb-4" size={42} />
        <h2 className="text-xl font-semibold">No Interns Found</h2>
        <p className="text-gray-500 mt-2">
          You don’t have any interns assigned yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Interns</h1>
        <p className="text-gray-500 mt-1">
          Interns enrolled under your programs
        </p>
      </div>

      {/* ENROLLMENT CARDS */}
      {enrollments.map((item) => (
        <div
          key={item._id}
          className="bg-white rounded-2xl shadow p-6 space-y-6"
        >
          {/* PROGRAM INFO */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {item.program.title}
              </h2>

              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <BookOpen size={16} />
                  {item.program.domain}
                </span>

                <span>Duration: {item.program.durationInWeeks} weeks</span>

                <span>
                  {new Date(item.program.startDate).toDateString()} —{" "}
                  {new Date(item.program.endDate).toDateString()}
                </span>
              </div>
            </div>

            <span
              className={`px-4 py-1.5 rounded-full text-sm font-semibold
              ${
                item.program.status === "active"
                  ? "bg-green-100 text-green-700"
                  : item.program.status === "completed"
                    ? "bg-gray-200 text-gray-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {item.program.status.toUpperCase()}
            </span>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-hidden rounded-xl border">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Intern Name
                  </th>
                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Enrolled On
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium">{item.intern.name}</td>

                  <td className="px-5 py-4 text-gray-600">
                    {item.intern.email}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {new Date(item.enrolledAt).toDateString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD */}
          <div className="md:hidden border rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-lg">{item.intern.name}</h3>

            <p className="text-sm flex items-center gap-2 text-gray-600">
              <Mail size={16} />
              {item.intern.email}
            </p>

            <p className="text-sm flex items-center gap-2 text-gray-500">
              <Calendar size={16} />
              Enrolled: {new Date(item.enrolledAt).toDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MentorInterns;
