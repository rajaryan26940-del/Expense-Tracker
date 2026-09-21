const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const registerUser = async (req, res) => {
  try {
   const { name, email, password } = req.body;

if (!name || name.trim() === "") {
  return res.status(400).json({
    message: "Please enter your name",
  });
}

if (!email || email.trim() === "") {
  return res.status(400).json({
    message: "Please enter your email",
  });
}
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email.trim())) {
  return res.status(400).json({
    message: "Please enter a valid email",
  });
}
   const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;

if (!passwordRegex.test(password)) {
  return res.status(400).json({
    message:
      "Password must be at least 6 characters and include a letter, number, and special character",
  });
}

const hashedPassword = await bcrypt.hash(password, 10);

const user = new User({
  name,
  email,
  password: hashedPassword,
});

    await user.save();

    res.send("User Registered Successfully");
  } catch (error) {
  console.log(error);

  if (error.code === 11000) {
    return res.status(400).json({
      message: "Email already exists",
    });
  }

  res.status(500).json({
    message: "Internal Server Error",
  });
}
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || email.trim() === "") {
  return res.status(400).json({
    message: "Please enter your email",
  });
}
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email.trim())) {
  return res.status(400).json({
    message: "Please enter a valid email",
  });
}

if (!password || password.trim() === "") {
  return res.status(400).json({
    message: "Please enter your password",
  });
}
    const user = await User.findOne({ email });
    if (!user) {
  return res.status(404).json({
    message: "User not found",
  });
}
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) {
  return res.status(401).json({
    message: "Invalid Password",
  });
}
const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

res.status(200).json({
  message: "Login Successful",
  token,
  name: user.name,
});
  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({
        message: "Please enter your email",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "If that email exists, a reset link has been generated.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password/${rawToken}`;

    console.log("Password reset link (would be emailed):", resetLink);

    res.status(200).json({
      message: "If that email exists, a reset link has been generated.",
      resetLink,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Missing token or new password",
      });
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters and include a letter, number, and special character",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };