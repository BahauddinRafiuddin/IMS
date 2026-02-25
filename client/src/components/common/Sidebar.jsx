import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  LogOut,
  NotebookPen 
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();

  const menus = {
    super_admin:[
      {name:'Dashboard',path:"/superadmin",icon:LayoutDashboard},
      {name:'Companies',path:'/superadmin/companies',icon:Users}
    ],
    admin: [
      { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
      { name: "Interns", path: "/admin/interns", icon: Users },
      { name: "Mentors", path: "/admin/mentors", icon: GraduationCap },
      { name: "Programs", path: "/admin/programs", icon: BookOpen },
    ],

    intern: [
      { name: "Dashboard", path: "/intern", icon: LayoutDashboard },
      { name: "My Programs", path: "/intern/myProgram", icon: BookOpen },
      { name: "My Tasks", path: "/intern/tasks", icon: Users },
      { name: "Performance", path: "/intern/performance", icon: GraduationCap },
      { name: "Certificate", path: "/intern/certificate", icon: BookOpen },
    ],

    mentor: [
      { name: "Dashboard", path: "/mentor", icon: LayoutDashboard },
      { name: "Programs", path: "/mentor/programs", icon: BookOpen },
      { name: "Interns", path: "/mentor/interns", icon: Users },
      { name: "Task", path: "/mentor/tasks", icon: NotebookPen  },
      {
        name: "Track Performance",
        path: "/mentor/performance",
        icon: GraduationCap,
      },
    ],
  };

  const menu = menus[user?.role] || [];

  return (
    <aside className="w-64 h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex flex-col">
      {/* LOGO */}
      <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-white/10">
        IMS {user?.role?.toUpperCase()}
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer
                 ${
                   isActive
                     ? "bg-white/15 text-white shadow"
                     : "text-gray-300 hover:bg-white/10 hover:text-white"
                 }`
              }
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg
                     text-gray-300 hover:bg-red-500/20 hover:text-red-400
                     transition cursor-pointer"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
