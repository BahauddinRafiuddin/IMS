import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { loginUser } from "../../api/auth.api";
import { Eye, EyeOff, X, Mail, Lock } from "lucide-react";
import { toastError, toastSuccess } from "../../utils/toast";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const emailRegex =
    /^[a-zA-Z][a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let err = {};

    if (!emailRegex.test(form.email)) {
      err.email = `"${form.email}" is not a valid email address`;
    }

    if (!form.password) {
      err.password = "Password is required";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const data = await loginUser(form);
      login(data);

      toastSuccess("Login successful");
      if (data.user.forcePasswordChange) {
        navigate("/change-password");
        return;
      }

      const role = data.user?.role || data.role;

      if (role === "super_admin") navigate("/superadmin");
      else if (role === "admin") navigate("/admin");
      else if (role === "mentor") navigate("/mentor");
      else navigate("/intern");
    } catch (err) {
      toastError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 font-sans p-4 overflow-hidden">
      {/* --- DECORATIVE BACKGROUND BLOBS (Matches Landing Page) --- */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

      {/* --- FORM CONTAINER --- */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/80 backdrop-blur-xl w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200/50"
      >
        {/* Close Button */}
        <Link 
          to="/" 
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </Link>

        {/* Header */}
        <div className="text-center mb-8 mt-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome  <span className="inline-block animate-wave">👋</span>
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Please enter your details to sign in.
          </p>
        </div>

        {/* EMAIL INPUT */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input
              name="email"
              placeholder="name@company.com"
              maxLength={50}
              value={form.email}
              onChange={handleChange}
              className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400
                ${errors.email 
                  ? "border-red-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500" 
                  : "border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300"
                }`}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 font-medium text-xs mt-1.5 ml-1">{errors.email}</p>
          )}
        </div>

        {/* PASSWORD INPUT */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input
              type={show ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={form.password}
              minLength={8}
              onChange={handleChange}
              className={`w-full pl-11 pr-12 py-3 bg-white border rounded-xl text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400
                ${errors.password 
                  ? "border-red-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500" 
                  : "border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300"
                }`}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 font-medium text-xs mt-1.5 ml-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <button
          disabled={loading}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-semibold shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex justify-center items-center cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;