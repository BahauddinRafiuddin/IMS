import { useState } from "react";
import { X } from "lucide-react";
import { toastError, toastSuccess } from "../../utils/toast";
import { createCompany } from "../../api/superAdmin.api";

const AddCompanyModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    commissionPercentage: 20,
    adminEmail: "",
    adminName: "",
    adminPassword: "",
  });

  const [errors, setErrors] = useState({});

  const emailRegex =
    /^[a-zA-Z][a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const phoneRegex = /^[0-9]{10}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "commissionPercentage" ? Number(value) : value,
    });

    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Company name is required";
    }

    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = "Invalid company email format";
    }

    if (form.phone && !phoneRegex.test(form.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (
      form.commissionPercentage === "" ||
      form.commissionPercentage < 0 ||
      form.commissionPercentage > 100
    ) {
      newErrors.commissionPercentage = "Commission must be between 0 and 100";
    }

    if (!form.adminName.trim()) {
      newErrors.adminName = "Admin name is required";
    }

    if (!emailRegex.test(form.adminEmail)) {
      newErrors.adminEmail = "Invalid admin email address";
    }

    if (!form.adminPassword || form.adminPassword.length < 8) {
      newErrors.adminPassword = "Password must be at least 8 characters long";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await createCompany(form);
      toastSuccess("Company and Admin created successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toastError(err.response?.data?.message || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition cursor-pointer"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Add New Company
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* COMPANY DETAILS */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-indigo-600">
              Company Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Company Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Company Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Phone</label>
                <input
                  name="phone"
                  maxLength={10}
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Commission Percentage (%) *
                </label>
                <div className="relative">
                  <input
                    name="commissionPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={form.commissionPercentage}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <span className="absolute right-3 top-3 text-gray-500">
                    %
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Super Admin will keep this percentage from each paid
                  enrollment.
                </p>
                {errors.commissionPercentage && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.commissionPercentage}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ADMIN DETAILS */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-indigo-600">
              Admin Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Admin Name *</label>
                <input
                  name="adminName"
                  value={form.adminName}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {errors.adminName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.adminName}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Admin Email *</label>
                <input
                  name="adminEmail"
                  type="email"
                  value={form.adminEmail}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {errors.adminEmail && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.adminEmail}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Admin Password *</label>
                <input
                  name="adminPassword"
                  type="password"
                  minLength={8}
                  maxLength={8}
                  value={form.adminPassword}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {errors.adminPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.adminPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition cursor-pointer disabled:opacity-60"
            >
              {loading ? "Creating Company..." : "Create Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompanyModal;
