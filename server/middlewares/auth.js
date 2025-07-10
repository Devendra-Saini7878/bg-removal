import jwt from 'jsonwebtoken';


//middleware function to decode jwt token to get clerk id

const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again." });
    }
    const token = authHeader.split(' ')[1];
    console.log("Token received:", token);

    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again." });
    }

    // Verify or decode the token
    const token_decode = jwt.decode(token);
console.log("Decoded token:", token_decode);

if (!token_decode || !token_decode.clerkId) {
  return res.status(401).json({ success: false, message: "Invalid token" });
}
// Use req.user or req.clerkId instead of req.body
req.user = { clerkId: token_decode.clerkId };
next();
  } catch (error) {
    console.error("Error in authUser middleware:", error);
    res.status(500).json({ success: false, message: "auth user middleware error" });
  }
};


export default authUser;