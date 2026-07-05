import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { registerUser } from "../services/authService";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function handleRegister() {
    if (name === "") {
  alert("Please enter your name");
  return;
}
if (email === "") {
  alert("Please enter your email");
  return;
}
if (password === "") {
  alert("Please enter your password");
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
  setLoading(false);
  alert(error.response?.data?.message || "Registration Failed");
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
</button>
    </div>
  );
}

export default Register;