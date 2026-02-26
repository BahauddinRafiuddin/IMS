import api from "./axios"


export const createCompany = async (data) => {
  const res = await api.post(`/companies`, data)
  return res.data
}

export const getAllcompanies = async () => {
  const res = await api.get('/companies')
  return res.data
}

export const toggleCompanyStatus = async (id) => {
  const res = await api.patch(`/companies/${id}`)
  return res.data
}

export const getSuperAdminDashboard = async () => {
  const res = await api.get("/superadmin/dashboard");
  return res.data;
}

export const getCompanyFinanceOverview = async () => {
  const res = await api.get('/superadmin/finance-data')
  return res.data;
}

export const getCompanyRevenueDetails = async (companyId) => {
  const res = await api.get(`/superadmin/company-finance/${companyId}`);
  return res.data;
};

export const getPlatformFinanceStats =async () => {
  const res=await api.get('/superadmin/platform-finance')
  return res.data
}