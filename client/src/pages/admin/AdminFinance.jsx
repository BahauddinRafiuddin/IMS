import { useEffect, useState } from "react";
import { IndianRupee, TrendingUp, Wallet, Repeat } from "lucide-react";
import { getAdminFinanceOverview } from "../../api/admin.api";
import StatCard from "../../components/ui/StatCard";

const AdminFinance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const res = await getAdminFinanceOverview();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinance();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading financial data...</div>;
  }

  const { summary, transactions } = data;

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Financial Overview
        </h1>
        <p className="text-gray-500 mt-1">
          View earnings, commission and transaction details
        </p>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${summary.totalRevenue}`}
          icon={IndianRupee}
          color="bg-blue-600"
        />

        <StatCard
          title="Platform Commission"
          value={`₹${summary.totalCommission}`}
          icon={TrendingUp}
          color="bg-indigo-600"
        />

        <StatCard
          title="Company Earnings"
          value={`₹${summary.totalCompanyEarning}`}
          icon={Wallet}
          color="bg-green-600"
        />

        <StatCard
          title="Total Transactions"
          value={summary.totalTransactions}
          icon={Repeat}
          color="bg-gray-700"
        />
      </div>

      {/* ================= WALLET SECTION ================= */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Wallet Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="text-xl font-bold text-emerald-600">
              ₹{summary.availableBalance}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Withdrawn</p>
            <p className="text-xl font-bold text-gray-700">
              ₹{summary.totalWithdrawn}
            </p>
          </div>
        </div>
      </div>

      {/* ================= TRANSACTION TABLE ================= */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Transactions
        </h2>

        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Intern</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Commission</th>
                  <th className="text-left px-4 py-3">Earning</th>
                  <th className="text-left px-4 py-3">Method</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {transactions.map((txn) => (
                  <tr
                    key={txn.paymentId}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {txn.internName}
                    </td>

                    <td className="px-4 py-3 text-blue-600 font-semibold">
                      ₹{txn.totalAmount}
                    </td>

                    <td className="px-4 py-3 text-indigo-600">
                      ₹{txn.superAdminCommission}
                    </td>

                    <td className="px-4 py-3 text-green-600 font-semibold">
                      ₹{txn.companyEarning}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {txn.paymentMethod}
                    </td>

                    <td className="px-4 py-3 text-gray-500">
                      {new Date(txn.createdAt).toLocaleDateString()}
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

export default AdminFinance;
