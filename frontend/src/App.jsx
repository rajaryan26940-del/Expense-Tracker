import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
 return (
  <>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/register"
        element={<Register />}
      />
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />
      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />
      <Route
        path="/dashboard"
        element={
          localStorage.getItem("token") ? (
            <Dashboard />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>

   <ToastContainer
  position="top-right"
  autoClose={2500}
  hideProgressBar={false}
  newestOnTop
  closeOnClick
  pauseOnHover
  closeButton={false}
  theme="colored"
/>
  </>
);
}

export default App;