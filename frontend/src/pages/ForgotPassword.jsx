import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Login.css";
import { forgotPassword } from "../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState("");

  async function handleForgotPassword() {
    if (email === "") {
      alert("Please enter your email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      alert("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      const data = await forgotPassword(email);

      setResetLink(data.resetLink || "");
      alert(data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <h1>Expense Tracker</h1>

      <h2>Forgot Password</h2>

      <input
        type="email"
        placeholder="Enter your registered email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={handleForgotPassword} disabled={loading}>
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

      {resetLink && (
        <p style={{ wordBreak: "break-all", fontSize: "13px" }}>
          Demo mode — no real email sent. Reset link:{" "}
          <Link to={resetLink.replace("http://localhost:5173", "")}>
            {resetLink}
          </Link>
        </p>
      )}

      <p>
        <Link to="/">Back to Login</Link>
      </p>
    </div>
  );
}

export default ForgotPassword;