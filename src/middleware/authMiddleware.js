import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const isUser = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!isUser) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid token",
      });
    }

    req.user = isUser;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "unauthorized",
      message: "Invalid or expired token",
    });
  }
};

export default protect;
