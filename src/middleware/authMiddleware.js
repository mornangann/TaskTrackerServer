import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/auth/UserModel.js";

export const protect = asyncHandler(async (req, res, next) => {
  // 1. Получаем токен из кук или заголовка Authorization
  let token;
  if (req.cookies.token) {
    token = req.cookies.token;
    console.log('Token from cookies:', token);
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token from headers:', token);
  }

  // 2. Проверка наличия токена
  if (!token) {
    console.log('No token found in cookies or headers');
    return res.status(401).json({ 
      message: "Not authorized, please login",
      errorType: "MISSING_TOKEN"
    });
  }

  try {
    // 3. Верификация токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // 4. Поиск пользователя
    const user = await User.findById(decoded.userId || decoded.id).select('-password');
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ 
        message: "User not found",
        errorType: "USER_NOT_FOUND"
      });
    }

    // 5. Добавляем пользователя в запрос
    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    
    // Детализированные ошибки
    let errorMessage = "Not authorized";
    let errorType = "AUTH_ERROR";
    
    if (error.name === 'TokenExpiredError') {
      errorMessage = "Session expired, please login again";
      errorType = "TOKEN_EXPIRED";
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = "Invalid token";
      errorType = "INVALID_TOKEN";
    }

    return res.status(401).json({ 
      message: errorMessage,
      errorType: errorType
    });
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
