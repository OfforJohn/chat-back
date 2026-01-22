import jwt from "jsonwebtoken";



export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token" });

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    req.user = { id: decoded.uid, email: decoded.email };
    next();
  } catch (err) {
    console.error("AuthMiddleware error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};


export const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).send("You are not authenticated!");
  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (err) return res.status(403).send("Token is not valid!");
    req.userId = payload?.userId;
    next();
  });
};

