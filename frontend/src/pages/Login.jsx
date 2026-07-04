import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { loginUser } from "../services/authService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const navigate = useNavigate();
  async function handleLogin() {
    if (email === "") {
      alert("Please enter your email");
      return;
    }

    if (password === "") {
      alert("Please enter your password");
      return;
    }

  try {
  const data = await loginUser({
    email,
    password,
  });

  localStorage.setItem("token", data.token);
localStorage.setItem("name", data.name);
  navigate("/dashboard");
} catch (error) {
  alert(error.response?.data?.message || "Login Failed");
}
  }

  return (
    <div className="login-container">
      <h1>Expense Tracker</h1>

      <h2>Login</h2>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
      <p>
  Don't have an account? <Link to="/register">Register</Link>
</p>
    </div>
  );
}

export default Login;