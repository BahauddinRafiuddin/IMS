import api from "./axios"


export const getDashboardData = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data;
}

export const getAllInterns = async (page, limit, search) => {
  const res = await api.get(`/admin/interns?page=${page}&limit=${limit}&search=${search}`);
  return res.data;
}

export const exportInternsApi = async (search, format) => {
  const res = await api.get(
    `/admin/intern/export?search=${search}&format=${format}`,
    { responseType: "blob" } // Critical for downloading files
  );

  // Logic to trigger browser download
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `interns.${format === 'excel' ? 'xlsx' : 'pdf'}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export const getAllMentors = async (page, limit, search) => {
  const res = await api.get(`/admin/mentors?page=${page}&limit=${limit}&search=${search}`)
  return res.data
}

export const exportMentorApi = async (search, format) => {
  const res = await api.get(
    `/admin/mentors/export?search=${search}&format=${format}`,
    { responseType: "blob" } // Critical for downloading files
  );

  // Logic to trigger browser download
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `mentors.${format === 'excel' ? 'xlsx' : 'pdf'}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export const updateInternStatus = async (internId, isActive) => {
  const res = await api.put(`/admin/intern/${internId}/status`, { isActive })
  return res.data;
}

export const assignMentor = async (internId, mentorId) => {
  const res = await api.put("/admin/assign-mentor", { internId, mentorId })
  return res.data
}

export const createMentor = async (data) => {
  const res = await api.post("/admin/mentor", data)
  return res.data
}

export const createIntern = async (data) => {
  const res = await api.post('/admin/intern', data)
  return res.data
}

export const deleteMentorById = async (mentorId) => {
  const res = await api.delete(`/admin/mentor/${mentorId}/delete`)
  return res.data
}
export const getAdminFinanceOverview = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString()
  const res = await api.get(`/admin/finance-overview?${query}`);
  return res.data;
}
export const getCompanyReviews = async () => {
  const res = await api.get('/admin/reviews')
  return res.data
}