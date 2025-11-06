import jwt from "jsonwebtoken";
const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none", // Allow cross-origin cookies (Vercel frontend <-> Render backend)
    secure: true, // Required for sameSite: none
    path: "/", // Ensure cookie is sent for all paths
  });
  return token;
};
export default generateToken;
