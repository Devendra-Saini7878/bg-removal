import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again." });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.clerkId) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.user = { clerkId: decoded.clerkId };
    next();
  } catch (error) {
    console.error("Error in authUser middleware:", error);
    res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token." });
  }
};

export default authUser;
