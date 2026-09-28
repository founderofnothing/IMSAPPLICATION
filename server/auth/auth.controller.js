import { loginService } from "./auth.service.js";

export const login = async (req, res) => {
  try {
    const result = await loginService(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};