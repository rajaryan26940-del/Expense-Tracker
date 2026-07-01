const User = require("../models/User");
const bcrypt = require("bcryptjs");
const registerUser = async (req, res) => {
  try {
   const { name, email, password } = req.body;

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
res.status(200).json({
  message: "Login Successful",
});
  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = { registerUser, loginUser };