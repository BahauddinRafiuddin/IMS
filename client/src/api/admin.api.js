import api from "./axios"


export const getDashboardData = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data;
}

export const getAllInterns = async () => {
  const res = await api.get('/admin/interns')
  return res.data
}

export const getAllMentors = async () => {
  const res = await api.get('/admin/mentors')
  return res.data
}

export const getAllPrograms = async () => {
  const res = await api.get('/admin/programs')
  return res.data
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