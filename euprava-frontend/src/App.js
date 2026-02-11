import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./App.css";

import Auth from "./pages/Auth";
import CitizenHome from "./pages/CitizenHome";
import OfficerHome from "./pages/OfficerHome";
import AdminHome from "./pages/AdminHome";

// Officer pages
import OfficerInbox from "./pages/officer/OfficerInbox";
import OfficerReview from "./pages/officer/OfficerReview";
import OfficerApprovals from "./pages/officer/OfficerApprovals";
import OfficerRejections from "./pages/officer/OfficerRejections";
import OfficerStatistics from "./pages/officer/OfficerStatistics";
import OfficerRequestDetails from "./pages/officer/OfficerRequestDetails";
import OfficerPayments from "./pages/officer/OfficerPayments";

// Citizen pages
import CitizenServices from "./pages/citizen/CitizenServices";
import CitizenRequests from "./pages/citizen/CitizenRequests";
import CitizenRequestNew from "./pages/citizen/CitizenRequestNew";
import CitizenRequestDetails from "./pages/citizen/CitizenRequestDetails";
import CitizenPayments from "./pages/citizen/CitizenPayments";
import CitizenStats from "./pages/citizen/CitizenStats";

// Admin pages (NEW)
import AdminUsers from "./pages/admin/AdminUsers";
import AdminInstitutions from "./pages/admin/AdminInstitutions";
import AdminTypes from "./pages/admin/AdminTypes";
import AdminServices from "./pages/admin/AdminServices";
import AdminStats from "./pages/admin/AdminStats"; // nedovršeno

function getSessionUser() {
  const raw = sessionStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isAuthed() {
  return Boolean(sessionStorage.getItem("token")) && Boolean(getSessionUser());
}

function getHomeByRole(role) {
  const r = String(role || "").toUpperCase();
  if (r === "ADMIN") return "/admin/home";
  if (r === "OFFICER") return "/officer/home";
  return "/citizen/home";
}

function RootRedirect() {
  if (!isAuthed()) return <Navigate to="/auth" replace />;
  const user = getSessionUser();
  return <Navigate to={getHomeByRole(user?.role)} replace />;
}

function ProtectedRoute({ allowedRoles, children }) {
  if (!isAuthed()) return <Navigate to="/auth" replace />;

  const user = getSessionUser();
  const role = String(user?.role || "").toUpperCase();

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getHomeByRole(role)} replace />;
  }

  return children;
}

export default function App() {
  const [, setAuthTick] = useState(0);

  useEffect(() => {
    const sync = () => setAuthTick((x) => x + 1);
    window.addEventListener("eu:session", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("eu:session", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const user = sessionStorage.getItem("user");
    if ((token && !user) || (!token && user)) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.dispatchEvent(new Event("eu:session"));
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/auth" element={isAuthed() ? <Navigate to="/" replace /> : <Auth />} />

        {/* =========================
            CITIZEN routes
           ========================= */}
        <Route
          path="/citizen/home"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <CitizenHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/services"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <CitizenServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/requests"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <CitizenRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/requests/new"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <CitizenRequestNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/requests/:id"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <CitizenRequestDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/payments"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <CitizenPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/stats"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <CitizenStats />
            </ProtectedRoute>
          }
        />

        {/* =========================
            OFFICER routes
           ========================= */}
        <Route
          path="/officer/home"
          element={
            <ProtectedRoute allowedRoles={["OFFICER"]}>
              <OfficerHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/inbox"
          element={
            <ProtectedRoute allowedRoles={["OFFICER"]}>
              <OfficerInbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/review"
          element={
            <ProtectedRoute allowedRoles={["OFFICER"]}>
              <OfficerReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/approvals"
          element={
            <ProtectedRoute allowedRoles={["OFFICER"]}>
              <OfficerApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/rejections"
          element={
            <ProtectedRoute allowedRoles={["OFFICER"]}>
              <OfficerRejections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/stats"
          element={
            <ProtectedRoute allowedRoles={["OFFICER"]}>
              <OfficerStatistics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/requests/:id"
          element={
            <ProtectedRoute allowedRoles={["OFFICER"]}>
              <OfficerRequestDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/officer/payments"
          element={
            <ProtectedRoute allowedRoles={["OFFICER"]}>
              <OfficerPayments />
            </ProtectedRoute>
          }
        />


        {/* =========================
            ADMIN routes
           ========================= */}
        <Route
          path="/admin/home"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/institutions"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminInstitutions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/types"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminTypes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/services"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminServices />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/stats"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminStats />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
