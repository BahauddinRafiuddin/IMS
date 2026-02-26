import { Route, Routes, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import { lazy, Suspense } from "react";
import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleRoute from "../components/common/RoleRoute";

const Landing = lazy(() => import("../pages/public/Landing"));

const Interns = lazy(() => import("../pages/admin/Interns"));
const Mentors = lazy(() => import("../pages/admin/Mentors"));
const Programs = lazy(() => import("../pages/admin/Programs"));

const Certificate = lazy(() => import("../pages/intern/Certificate"));
const InternPrograms = lazy(() => import("../pages/intern/InternProgram"));
const InternTasks = lazy(() => import("../pages/intern/InternTasks"));
const Performance = lazy(() => import("../pages/intern/Performance"));

const MentorPrograms = lazy(() => import("../pages/mentor/MentorPrograms"));
const MentorTasks = lazy(() => import("../pages/mentor/MentorTasks"));
const MentorInterns = lazy(() => import("../pages/mentor/MentorInterns"));
const InternPerformance = lazy(
  () => import("../pages/mentor/InternPerformance"),
);

const Companies = lazy(() => import("../pages/superadmin/Companies"));
const Profile = lazy(() => import("../pages/common/Profile"));
const SuperAdminLayout = lazy(() => import("../layouts/SuperAdminLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const MentorLayout = lazy(() => import("../layouts/MentorLayout"));
const InternLayout = lazy(() => import("../layouts/InternLayout"));

const SuperAdminDashboard = lazy(() => import("../pages/superadmin/Dashboard"));
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));
const MentorDashboard = lazy(() => import("../pages/mentor/Dashboard"));
const InternDashboard = lazy(() => import("../pages/intern/Dashboard"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          {/* Super Admin */}
          <Route element={<RoleRoute allowedRoles={["super_admin"]} />}>
            <Route path="/superadmin" element={<SuperAdminLayout />}>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="companies" element={<Companies />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="interns" element={<Interns />} />
              <Route path="mentors" element={<Mentors />} />
              <Route path="programs" element={<Programs />} />
            </Route>
          </Route>

          {/* Mentor */}
          <Route element={<RoleRoute allowedRoles={["mentor"]} />}>
            <Route path="/mentor" element={<MentorLayout />}>
              <Route index element={<MentorDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="programs" element={<MentorPrograms />} />
              <Route path="tasks" element={<MentorTasks />} />
              <Route path="interns" element={<MentorInterns />} />
              <Route path="performance" element={<InternPerformance />} />
            </Route>
          </Route>

          {/* Intern */}
          <Route element={<RoleRoute allowedRoles={["intern"]} />}>
            <Route path="/intern" element={<InternLayout />}>
              <Route index element={<InternDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="myProgram" element={<InternPrograms />} />
              <Route path="tasks" element={<InternTasks />} />
              <Route path="performance" element={<Performance />} />
              <Route path="certificate" element={<Certificate />} />
            </Route>
          </Route>
        </Route>
        {/* <Route path="*" element={<Navigate to="/login" />} /> */}
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
