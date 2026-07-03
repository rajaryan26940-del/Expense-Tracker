import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
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
  );
}

export default App;