import { useEffect, useState } from "react";
import {
  IndianRupee,
  BookOpen,
  Calendar,
  Receipt
} from "lucide-react";
import { getInternPaymentHistory } from "../../api/intern.api";
import StatCard from "../../components/ui/StatCard";

const InternPayments = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await getInternPaymentHistory();
        setData(res);
      } catch (error) {
        console.error("Payment fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading payment history...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-red-500">
        Failed to load payment data
      </div>
    );
  }

  const { summary, payments } = data;

  return (
    <div className="space-y-10">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Payment History
        </h1>
        <p className="text-gray-500 mt-1">
          View all your internship payment records
        </p>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

        <StatCard
          title="Total Amount Paid"
          value={`₹${summary.totalPaid}`}
          icon={IndianRupee}
          color="bg-blue-600"
        />

        <StatCard
          title="Programs Purchased"
          value={summary.totalProgramsPurchased}
          icon={BookOpen}
          color="bg-green-600"
        />

        <StatCard
          title="Last Payment Date"
          value={
            summary.lastPaymentDate
              ? new Date(summary.lastPaymentDate).toLocaleDateString()
              : "N/A"
          }
          icon={Calendar}
          color="bg-indigo-600"
        />

      </div>

      {/* ================= TRANSACTION TABLE ================= */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Transaction Details
        </h2>

        {payments.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No payments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Program</th>
                  <th className="text-left px-4 py-3">Company</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Method</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {payments.map((payment) => (
                  <tr
                    key={payment.paymentId}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {payment.programTitle}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {payment.companyName}
                    </td>

                    <td className="px-4 py-3 font-semibold text-blue-600">
                      ₹{payment.amount}
                    </td>

                    <td className="px-4 py-3 text-gray-600 capitalize">
                      {payment.paymentMethod}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                        {payment.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default InternPayments;