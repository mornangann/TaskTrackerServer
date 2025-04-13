import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/auth/UserModel.js";

export const protect = asyncHandler(async (req, res, next) => {
  try {
    // check if usr is logged in
    const token = req.cookies.token;
    console.log("Token from cookies:", token); // Логирование токена

    if (!token) {
      console.log("No token found in cookies");
      return res
        .status(401)
        .json({ message: "Для этого действия необходимо быть авторизованным" });
    }

    //verify user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Логирование декодированного токена

    //get user details from the token ---> exclude password
    const user = await User.findById(decoded.userId || decoded.id).select(
      "-password"
    );

    //check if user exists
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    //set user details in the request object
    req.user = user;

    next();
  } catch (error) {
    console.log("Ошибка в функции protect:", error); // Логирование ошибки
    return res
      .status(401)
      .json({ message: "Для этого действия необходимо быть авторизованным" });
  }
});

//admin middleware
export const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
    return;
  }
  res.status(403).json({ message: "Not authorized as an admin" });
});

export const creatorMiddleware = asyncHandler(async (req, res, next) => {
  if (
    (req.user && req.user.role === "creator") ||
    (req.user && req.user.role === "admin")
  ) {
    next();
    return;
  } else {
    res
      .status(403)
      .json({ message: "Для этого действия необходимо быть авторизованным" });
  }
});

//verified middleware
export const verifiedMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
    return;
  }
  res.status(403).json({ message: "Please verify your email address" });
});
