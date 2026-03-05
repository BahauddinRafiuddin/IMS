/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  Wallet,
  Repeat,
  Download,
} from "lucide-react";
import { getAdminFinanceOverview } from "../../api/admin.api";
import StatCard from "../../components/ui/StatCard";
import * as XLSX from "xlsx";
import { toastError } from "../../utils/toast";

const AdminFinance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const [filters, setFilters] = useState({
    commission: "",
    startDate: "",
    endDate: "",
  });

  const fetchFinance = async () => {
    try {
      setLoading(true);
      const res = await getAdminFinanceOverview(filters);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchFinance();
  };

  const resetFilters = () => {
    setFilters({
      commission: "",
      startDate: "",
      endDate: "",
    });
  };

  const downloadExcel = () => {
    if (!transactions.length) {
      return toastError("No data to export");
    }
    const sheetData = data.transactions.map((txn) => ({
      Intern: txn.intern?.name,
      Email: txn.intern?.email,
      Program: txn.program?.title,
      Amount: txn.totalAmount,
      Commission: txn.superAdminCommission,
      CommissionPercentage: txn.commissionPercentage,
      CompanyEarning: txn.companyEarning,
      Method: txn.paymentMethod,
      Date: new Date(txn.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    XLSX.writeFile(workbook, "Company_Transactions.xlsx");
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading financial data...</div>;
  }
  if (!data) {
    return (
      <div className="py-20 text-center text-red-500">
        Failed to load dashboard
      </div>
    )
  }
  const { summary, transactions, commissionBreakdown } = data;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Financial Overview
          </h1>
          <p className="text-gray-500 mt-1">
            View earnings and transaction details
          </p>
        </div>

        <button
          onClick={downloadExcel}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          <Download size={18} />
          Download Excel
        </button>
      </div>

      {/* SUMMARY CARDS */}
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

      {/* FILTERS */}
      <div className="bg-white border rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {/* Commission */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Commission %
              </label>
              <input
                type="number"
                name="commission"
                value={filters.commission}
                onChange={handleFilterChange}
                placeholder="e.g. 10"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Start Date */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={applyFilters}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition cursor-pointer"
            >
              Apply Filters
            </button>

            <button
              onClick={resetFilters}
              className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* COMMISSION BREAKDOWN */}
      <div className="bg-white rounded-xl shadow-sm border">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold text-gray-700">Commission Breakdown</h2>

          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition cursor-pointer"
          >
            {showBreakdown ? "Hide" : "View"}
          </button>
        </div>

        {/* Collapsible Content */}
        {showBreakdown && (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Commission %</th>
                  <th className="px-4 py-3 text-left">Revenue</th>
                  <th className="px-4 py-3 text-left">Platform Commission</th>
                  <th className="px-4 py-3 text-left">Total Earning </th>
                  <th className="px-4 py-3 text-left">Transactions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {commissionBreakdown.map((b) => (
                  <tr key={b._id}>
                    <td className="px-4 py-3">{b._id}%</td>
                    <td className="px-4 py-3">₹{b.totalRevenue}</td>
                    <td className="px-4 py-3 text-indigo-600">
                      ₹{b.totalCommission}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-semibold">
                      ₹{b.totalEarning}
                    </td>
                    <td className="px-4 py-3">{b.totalTransactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TRANSACTION TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Transactions
        </h2>

        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Intern</th>
                  <th className="text-left px-4 py-3">Program</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Commission</th>
                  <th className="text-left px-4 py-3">%</th>
                  <th className="text-left px-4 py-3">Earning</th>
                  <th className="text-left px-4 py-3">Method</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {txn.intern?.name}
                    </td>

                    <td className="px-4 py-3">{txn.program?.title}</td>

                    <td className="px-4 py-3 text-blue-600 font-semibold">
                      ₹{txn.totalAmount}
                    </td>

                    <td className="px-4 py-3 text-indigo-600">
                      ₹{txn.superAdminCommission}
                    </td>

                    <td className="px-4 py-3">{txn.commissionPercentage}%</td>

                    <td className="px-4 py-3 text-green-600 font-semibold">
                      ₹{txn.companyEarning}
                    </td>

                    <td className="px-4 py-3">{txn.paymentMethod}</td>

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
