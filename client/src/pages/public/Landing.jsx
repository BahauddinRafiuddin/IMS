import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { GraduationCap, Users, ClipboardList, Menu, X, ArrowRight } from "lucide-react";

const Landing = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* --- DECORATIVE BACKGROUND BLOBS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* ================= NAVBAR ================= */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3">
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Internship<span className="text-indigo-600">MS</span>
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/login"
              className="text-slate-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" 
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {open && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-6 space-y-4 shadow-xl absolute w-full">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block w-full text-center py-3 rounded-xl border-2 border-indigo-50 text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
            >
              Log in
            </Link>
          </div>
        )}
      </nav>

      {/* ================= HERO ================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* TEXT CONTENT */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-6">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
              The ultimate platform for institutions
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              Manage Internships with <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-blue-500">Confidence.</span>
            </h2>

            <p className="mt-6 text-slate-600 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0">
              A powerful, all-in-one platform to seamlessly manage interns, assign tasks, track performance, and auto-generate certificates.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/login"
                className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                Start for free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* <Link
                to="/login"
                className="px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-700 rounded-full font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-all duration-200 text-center"
              >
                View Dashboard
              </Link> */}
            </div>
          </div>

          {/* FEATURES GRID */}
          <div className="grid sm:grid-cols-2 gap-4 lg:gap-6 mt-12 lg:mt-0 relative">
            <Feature
              icon={<Users size={24} />}
              title="Mentor Dashboard"
              text="Review tasks, track intern progress and performance easily."
            />
            <Feature
              icon={<ClipboardList size={24} />}
              title="Task Management"
              text="Assign tasks, track submissions, and handle approvals."
              className="sm:translate-y-8" // Staggered effect
            />
            <Feature
              icon={<GraduationCap size={24} />}
              title="Smart Certificates"
              text="Auto-generate completion certificates instantly."
            />
            <Feature
              icon={<ClipboardList size={24} />}
              title="Analytics Tracking"
              text="Monitor attendance, scores, and late submissions."
              className="sm:translate-y-8" // Staggered effect
            />
          </div>
        </div>
      </section>
    </div>
  );
};

// ================= COMPONENT =================
const Feature = ({ icon, title, text, className = "" }) => (
  <div className={`group bg-white/60 backdrop-blur-lg p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1 ${className}`}>
    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-inner">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
  </div>
);

export default Landing;