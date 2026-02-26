/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import AddCompanyModal from "../../components/superadmin/AddCompanyModal";
import { toastError, toastSuccess } from "../../utils/toast";
import { getAllcompanies, toggleCompanyStatus } from "../../api/superAdmin.api";
import ConfirmModal from "../../components/common/ConfirmModal";
import CompanyRevenueModal from "../../components/superadmin/CompanyRevenueModal";

const SuperAdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [toggleStatus, setToggleStatus] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

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
      const res = await toggleCompanyStatus(id);
      toastSuccess(res.message || "Company status updated");
      setToggleStatus(null);
      fetchCompanies();
    } catch {
      toastError("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Companies
          </h1>
          <p className="text-gray-500 text-sm">
            Manage companies and view financial insights
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-sm transition font-medium"
        >
          + Add Company
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading companies...
          </div>
        ) : companies.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No companies found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* HEADER */}
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Company</th>
                  <th className="text-left px-6 py-4 font-semibold">
                    Admin Email
                  </th>
                  <th className="text-left px-6 py-4 font-semibold">
                    Commission
                  </th>
                  <th className="text-left px-6 py-4 font-semibold">Status</th>
                  <th className="text-right px-6 py-4 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody className="divide-y">
                {companies.map((company) => (
                  <tr key={company._id} className="hover:bg-gray-50 transition">
                    {/* Company Name */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">
                        {company.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {company._id.slice(-6)}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-gray-600">
                      {company.email || "No email provided"}
                    </td>

                    {/* Commission */}
                    <td className="px-6 py-4">
                      <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
                        {company.commissionPercentage || 0}%
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          company.isActive
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {company.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-4">
                        {/* Revenue Button */}
                        <button
                          onClick={() => setSelectedCompany(company)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition cursor-pointer"
                        >
                          Revenue
                        </button>

                        {/* Toggle Button */}
                        <button
                          onClick={() => setToggleStatus(company)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                        >
                          {company.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}
      {openModal && (
        <AddCompanyModal
          onClose={() => setOpenModal(false)}
          onSuccess={fetchCompanies}
        />
      )}

      {toggleStatus && (
        <ConfirmModal
          title="Change Company Status"
          message={`Are you sure you want to ${
            toggleStatus.isActive ? "deactivate" : "activate"
          } this company?`}
          onCancel={() => setToggleStatus(null)}
          onConfirm={() => handleToggle(toggleStatus._id)}
        />
      )}

      {selectedCompany && (
        <CompanyRevenueModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
};

export default SuperAdminCompanies;
