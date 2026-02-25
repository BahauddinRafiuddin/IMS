import api from "./axios"

export const getAllPrograms = async () => {
  const res = await api.get('/programs')
  return res.data
}

export const createProgram = async (data) => {
  const res = await api.post('/programs', data)
  return res.data
}

export const changeProgramStatus = async (progId, status) => {
  const res = await api.put(`/admin/program/${progId}/status`, { changedStatus: status })
  return res.data
}

export const updateProgram = async (progId, data) => {
  const res = await api.put(`/admin/program/${progId}`, data)
  return res.data
}

export const enrollIntern = async (internId, programId) => {
  const res = await api.post(`/enrollments`, { internId,programId })
  return res.data
};

export const getAvailableInterns = async () => {
  const res = await api.get("/admin/available-interns");
  return res.data;
};
