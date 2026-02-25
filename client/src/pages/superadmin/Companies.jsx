/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import AddCompanyModal from "../../components/superadmin/AddCompanyModal";
import { toastError, toastSuccess } from "../../utils/toast";
import { getAllcompanies, toggleCompanyStatus } from "../../api/superAdmin.api";

const SuperAdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await getAllcompanies();
      setCompanies(data.companies || []);
    } catch (err) {
      toastError("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleToggle = async (id) => {
    try {
      await toggleCompanyStatus(id);
      toastSuccess("Company status updated");
      fetchCompanies();
    } catch {
      toastError("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Companies</h1>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition cursor-pointer"
        >
          + Add Company
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : companies.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No companies found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3">Company</th>
                <th className="text-left p-3">Admin Email</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company._id} className="border-t">
                  <td className="p-3 font-medium">{company.name}</td>
                  <td className="p-3">{company.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        company.isActive
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {company.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggle(company._id)}
                      className="text-indigo-600 hover:underline cursor-pointer"
                    >
                      Toggle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {openModal && (
        <AddCompanyModal
          onClose={() => setOpenModal(false)}
          onSuccess={fetchCompanies}
        />
      )}
    </div>
  );
};

export default SuperAdminCompanies;