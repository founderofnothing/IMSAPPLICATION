import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    {
         userId: user._id,
      role: user.role,
      institution: user.institution,
      department: user.department,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export default generateToken;