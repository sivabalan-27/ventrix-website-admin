
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Overview from "./pages/Overview";
import Applications from "./pages/Applications";
import Enquiries from "./pages/Enquiries";

function App() {
  const isAuthenticated = Boolean(localStorage.getItem("adminToken"));

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/enquiries" element={<Enquiries />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
