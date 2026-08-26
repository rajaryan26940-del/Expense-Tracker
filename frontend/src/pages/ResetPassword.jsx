import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";
import { resetPassword } from "../services/authService";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetPassword() {
    if (newPassword === "") {
      alert("Please enter a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const data = await resetPassword(token, newPassword);

      alert(data.message);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <h1>Expense Tracker</h1>

      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button onClick={handleResetPassword} disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </button>

      <p>
        <Link to="/">Back to Login</Link>
      </p>
    </div>
  );
}

export default ResetPassword;