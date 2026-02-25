import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { GraduationCap, Users, ClipboardList, Menu, X } from "lucide-react";

const Landing = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* ================= NAVBAR ================= */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2">
            <img src={logo} alt="" />
            <h1 className="text-xl sm:text-2xl font-bold text-indigo-700">
              InternshipMS
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            <Link
              to="/login"
              className="px-5 py-2 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden bg-white border-t px-4 py-4 space-y-3">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block w-full text-center py-2 rounded-lg border border-indigo-600 text-indigo-600"
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="block w-full text-center py-2 rounded-lg bg-indigo-600 text-white"
            >
              Register
            </Link>
          </div>
        )}
      </nav>

      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        {/* TEXT */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            Internship Management
            <span className="text-indigo-600"> System</span>
          </h2>

          <p className="mt-6 text-gray-600 text-base sm:text-lg">
            Manage interns, tasks, performance, reviews and certificates — all
            in one powerful platform designed for colleges and companies.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-center md:justify-start">
            <Link
              to="/register"
              className="px-7 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-center"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="px-7 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition text-center"
            >
              Login
            </Link>
          </div>
        </div>

        {/* FEATURES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Feature
            icon={<Users size={26} />}
            title="Mentor Dashboard"
            text="Review tasks, track intern progress and performance easily."
          />

          <Feature
            icon={<ClipboardList size={26} />}
            title="Task Management"
            text="Assign tasks, submissions, approvals and rejections."
          />

          <Feature
            icon={<GraduationCap size={26} />}
            title="Certificates"
            text="Auto-generate internship completion certificates."
          />

          <Feature
            icon={<ClipboardList size={26} />}
            title="Performance Tracking"
            text="Attendance, scores, late submissions and analytics."
          />
        </div>
      </section>

      {/* ================= FOOTER =================
      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm absolute bottom-0 w-full">
        © {new Date().getFullYear()} Smart Internship Management System. All
        rights reserved.
      </footer> */}
    </div>
  );
};

const Feature = ({ icon, title, text }) => (
  <div className="bg-white p-6 rounded-xl shadow flex gap-4 items-start">
    <div className="text-indigo-600">{icon}</div>
    <div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{text}</p>
    </div>
  </div>
);

export default Landing;
