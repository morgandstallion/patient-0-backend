import { prisma } from "../config/db.js";

const updateUser = async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, email } = req.body;

  if (email) {
    const isRegisteredEmail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (isRegisteredEmail && isRegisteredEmail.id !== userId) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      firstName,
      lastName,
      email,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
    },
  });
};

const deleteUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const isUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!isUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(422).json({
      error: error.message,
    });
  }
};

export { updateUser, deleteUser };
