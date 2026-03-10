/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { getAllTransactionReport } from "../../api/superAdmin.api";
import { toastError } from "../../utils/toast";
import * as XLSX from "xlsx";

const SuperAdminFinance = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [breakdown, setBreakdown] = useState([]);
  const [filters, setFilters] = useState({
    commission: "",
    startDate: "",
    endDate: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllTransactionReport(filters);

      setTransactions(res.transactions || []);
      setSummary(res.summary || {});
      setBreakdown(res.commissionBreakdown || []);
    } catch (err) {
      toastError("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportExcel = () => {
    if (!transactions.length) {
      return toastError("No data to export");
    }

    const excelData = transactions.map((t) => ({
      Company: t.company?.name,
      Intern: t.intern?.name,
      Email: t.intern?.email,
      Program: t.program?.title,
      Amount: t.totalAmount,
      "Commission %": t.commissionPercentage,
      "Super Admin Commission": t.superAdminCommission,
      "Company Earning": t.companyEarning,
      Date: new Date(t.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    XLSX.writeFile(workbook, "platform_transactions.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Platform Transactions
          </h1>
          <p className="text-gray-500 text-sm">
            Overview of all company transactions
          </p>
        </div>

        <button
          onClick={exportExcel}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition cursor-pointer"
        >
          <Download size={16} />
          Download Excel
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border grid md:grid-cols-4 gap-4">
        <input
          type="number"
          placeholder="Commission %"
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={filters.commission}
          onChange={(e) =>
            setFilters({ ...filters, commission: e.target.value })
          }
        />

        <input
          type="date"
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
        />

        <input
          type="date"
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={filters.endDate}
          onChange={(e) =>
            setFilters({ ...filters, endDate: e.target.value })
          }
        />

        <button
          onClick={fetchData}
          className="bg-gray-800 hover:bg-gray-900 text-white rounded-lg px-4 py-2 transition cursor-pointer"
        >
          Apply Filters
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card title="Total Revenue" value={`₹${summary.totalRevenue || 0}`} />
        <Card title="Total Commission" value={`₹${summary.totalCommission || 0}`} />
        <Card title="Company Earnings" value={`₹${summary.totalCompanyEarning || 0}`} />
        <Card title="Transactions" value={summary.totalTransactions || 0} />
      </div>

      {/* COMMISSION BREAKDOWN */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <h2 className="font-semibold text-gray-700 mb-3">
          Commission Breakdown
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Commission %</th>
                <th className="px-4 py-3 text-left">Revenue</th>
                <th className="px-4 py-3 text-left">Commission Earned</th>
                <th className="px-4 py-3 text-left">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {breakdown.map((b) => (
                <tr key={b._id}>
                  <td className="px-4 py-3">{b._id}%</td>
                  <td className="px-4 py-3">₹{b.totalRevenue}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">
                    ₹{b.totalCommission}
                  </td>
                  <td className="px-4 py-3">{b.totalTransactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading transactions...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Intern</th>
                <th className="px-4 py-3 text-left">Program</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Commission %</th>
                <th className="px-4 py-3 text-left">Commission</th>
                <th className="px-4 py-3 text-left">Earning</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {t.company?.name}
                  </td>
                  <td className="px-4 py-3">{t.intern?.name}</td>
                  <td className="px-4 py-3">{t.program?.title}</td>
                  <td className="px-4 py-3">₹{t.totalAmount}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">{t.commissionPercentage}%</td>
                  <td className="px-4 py-3 text-indigo-600 font-semibold">
                    ₹{t.superAdminCommission}
                  </td>
                  <td className="px-4 py-3 text-green-600 font-semibold">
                    ₹{t.companyEarning}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow-sm border p-4">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-xl font-semibold text-gray-800 mt-1">{value}</p>
  </div>
);

export default SuperAdminFinance;