import api from "./axios"

export const getMyTasks = async () => {
  const res = await api.get('/intern/task')
  return res.data
}

export const getMyPerformance = async (programId) => {
  const res = await api.get(`/performance/intern/${programId}`)
  return res.data
}

export const getMyProgram = async () => {
  const res = await api.get("/intern/my-programs")
  return res.data
}

export const submitTask = async (taskId, data) => {
  const res = await api.post(`/intern/task/${taskId}/submit`, data)
  return res.data
}

export const checkCertificateEligibility = async (programId) => {
  const res = await api.get(`/certificate/eligibility/${programId}`)
  return res.data
}

export const generateCertificate = async (programId) => {
  const res = await api.get(
    `/certificate/download/${programId}`,
    { responseType: "blob" }   // ⭐ REQUIRED
  );
  return res.data;
};

export const startInternship = async (enrollmentId) => {
  const res = await api.post("/intern/start", { enrollmentId });
  return res.data;
};

export const createPaymentOrder = async (enrollmentId) => {
  const res = await api.post("/payment/create-order", { enrollmentId });
  return res.data;
};

export const verifyPayment = async (paymentData) => {
  const res = await api.post("/payment/verify", paymentData);
  return res.data;
};

export const getInternPaymentHistory=async () => {
  const res=await api.get('/intern/payment-history')
  return res.data
}