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

      if (data.user.role === "super_admin") navigate("/superadmin");
      else if (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "mentor") navigate("/mentor");
      else navigate("/intern");
    } catch (err) {
      toastError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BLUR BACKGROUND */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-indigo-100 backdrop-blur-sm"></div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white w-full max-w-md p-8 rounded-2xl shadow-xl mx-4"
      >
        <Link to="/" className="absolute right-3 top-3 text-gray-400">
          <X />
        </Link>

        <h2 className="text-2xl font-bold text-center mb-6">Welcome Back 👋</h2>

        {/* EMAIL */}
        <label className="block text-sm font-medium mb-1">Email Address</label>

        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            name="email"
            placeholder="Enter your email address"
            maxLength={50}
            value={form.email}
            onChange={handleChange}
            className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg text-sm
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {errors.email && (
          <p className="text-red-500 font-bold text-xs mt-1">{errors.email}</p>
        )}

        {/* PASSWORD */}
        <label className="block text-sm font-medium mt-4 mb-1">Password</label>

        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={18} />

          <input
            type={show ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            value={form.password}
            minLength={8}
            // maxLength={8}
            onChange={handleChange}
            className="w-full pl-10 pr-10 px-4 py-2.5 border border-gray-300 rounded-lg text-sm
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />

          <span
            onClick={() => setShow(!show)}
            className="absolute right-3 top-3 cursor-pointer text-gray-500"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        {errors.password && (
          <p className="text-red-500 font-bold text-xs mt-1">
            {errors.password}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700
          text-white py-2.5 rounded-lg font-medium transition disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
