// middleware/authUser.js
import getPrismaInstance from "./PrismaClient.js";

export const authUser = async (req, res, next) => {
  try {
    const firebaseUid = req.headers["x-firebase-uid"];

    if (!firebaseUid) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    req.user = user; // 🔐 attach backend user
    next();
  } catch (err) {
    next(err);
  }
};
