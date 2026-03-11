import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getSingleCompanyComissionHistory } from "../../api/superAdmin.api";
import Pagination from "../common/Pagination";
import TableExportButtons from "../common/TableExportButtons";

const CompanyCommissionHistoryModal = ({ company, onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getSingleCompanyComissionHistory(company._id);

        setData(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [company]);

  const totalPages = Math.ceil(data.length / limit);

  const start = (page - 1) * limit;
  const paginatedData = data.slice(start, start + limit);
  const exportData = data.map((data) => ({
    Company: data.companyName,
    Commission: data.commissionPercentage + "%",
    "Start Date": new Date(data.startDate).toLocaleDateString(),
    "End Date": data.endDate
      ? new Date(data.endDate).toLocaleDateString()
      : "Active",
    "Duration (Days)": data.durationDays,
  }));
  const columns = [
    "Company",
    "Commission",
    "Start Date",
    "End Date",
    "Duration (Days)",
  ];
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-8 relative">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition cursor-pointer"
        >
          <X size={22} />
        </button>

        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{company.name}</h2>
          <p className="text-sm text-gray-500">Commission History</p>
        </div>

        {/* EXPORT BUTTONS */}
        <div className="flex justify-end mb-4">
          <TableExportButtons
            data={exportData}
            columns={columns}
            fileName="commission-history"
          />
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">
            Loading commission history...
          </div>
        ) : (
          <>
            {/* TABLE */}
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Company</th>
                    <th className="px-4 py-3 text-left">Commission</th>
                    <th className="px-4 py-3 text-left">Start Date</th>
                    <th className="px-4 py-3 text-left">End Date</th>
                    <th className="px-4 py-3 text-left">Duration</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {paginatedData.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium">
                        {item.companyName}
                      </td>

                      <td className="px-4 py-3">
                        <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
                          {item.commissionPercentage}%
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {new Date(item.startDate).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3">
                        {item.endDate
                          ? new Date(item.endDate).toLocaleDateString()
                          : "Active"}
                      </td>

                      <td className="px-4 py-3">{item.durationDays} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </>
        )}

        {/* FOOTER */}
        <div className="mt-8 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition cursor-pointer font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyCommissionHistoryModal;
