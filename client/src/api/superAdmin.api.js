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
}

export const getPlatformFinanceStats = async () => {
  const res = await api.get('/superadmin/platform-finance')
  return res.data
}

export const updateCompanyCommission = async (companyId, commissionPercentage) => {
  const res = await api.put(
    `/superadmin/update-comission/${companyId}`,
    { commissionPercentage }
  )
  return res.data
}

export const getAllTransactionReport = async (
  filters = {}
) => {
  const query = new URLSearchParams(filters).toString()

  const res = await api.get(
    `/superadmin/transactions?${query}`
  )

  return res.data
}

export const getAllCompaniesCommissionHistory = async () => {
  const res = await api.get('/superadmin/comission-history')
  return res.data
}
export const getSingleCompanyComissionHistory = async (companyId) => {
  const res = await api.get(`/superadmin/comission-history/${companyId}`)
  return res.data
}
export const getPendingReviews = async () => {
  const res = await api.get('/superadmin/pending-reviews')
  return res.data
}

export const approveReview = async (reviewId) => {
  const res = await api.put(`/superadmin/approveReview/${reviewId}`)
  return res.data
}

export const rejectReview = async (reviewId) => {
  const res = await api.put(`/superadmin/rejectReview/${reviewId}`)
  return res.data
}