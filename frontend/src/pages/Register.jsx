import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { registerUser } from "../services/authService";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function handleRegister() {
    if (name.trim() === "") {
  alert("Please enter your name");
  return;
}
if (email.trim() === "") {
  alert("Please enter your email");
  return;
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
  alert("Please enter a valid email");
  return;
}
if (password.trim() === "") {
  alert("Please enter your password");
  return;
}
if (
  password.length < 6 ||
  !/[A-Za-z]/.test(password) ||
  !/[0-9]/.test(password) ||
  !/[^A-Za-z0-9]/.test(password)
) {
  alert(
    "Password must be at least 6 characters and include a letter, number, and special character"
  );
  return;
}
  try {
    setLoading(true);
  const data = await registerUser({
    name,
    email,
    password,
  });

 alert("Registration Successful! Please login.");
  navigate("/");
} catch (error) {
  console.log(error);
  alert(error.response?.data?.message || "Registration Failed");
}finally {
  setLoading(false);
}
}

  return (
    <div className="login-container">
      <h1>Expense Tracker</h1>

      <h2>Register</h2>

      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

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

     <button onClick={handleRegister} disabled={loading}>
  {loading ? "Registering..." : "Register"}
</button> <p>
  Already have an account? <Link to="/">Login</Link>
</p>
    </div>
  );
}

export default Register;