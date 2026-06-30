import { useState } from "react";
import "../styles/Login.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  function handleRegister() {
  alert(
    `Name: ${name}\nEmail: ${email}\nPassword: ${password}`
  );
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

     <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;