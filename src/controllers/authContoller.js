import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

const register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // check if user is registered
  const isRegistered = await prisma.user.findUnique({
    where: { email: email },
  });

  if (isRegistered) {
    res.status(400).json({ error: "User already exists with this email" });
  }

  //   Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //   Create user
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "CUSTOMER",
    },
  });

  //   generate JWT Token
  const token = generateToken(user.id, res);

  res.status(201).json({
    status: "success",
    data: {
      id: user.id,
      firstName: firstName,
      lastName: lastName,
      email: email,
    },
    token,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // check if user is registered
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    res.status(400).json({ error: "Invalid email or password" });
  }

  //   verify Password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(400).json({ error: "Invalid email or password" });
  }

  //   generate JWT Token
  const token = generateToken(user.id, res);

  res.status(201).json({
    status: "success",
    data: {
      id: user.id,
      email: email,
    },
    token,
  });
};

const logout = async (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(0),
    httpOnly: true,
  });
  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
};

export { register, login, logout };
