import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      employeeId: user.employeeId,
      email: user.email,
      firstName: user.firstName || user.name || '',
      lastName: user.lastName || '',
      role: user.role,
    },
    process.env.JWT_SECRET || 'interskill_jwt_secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
    },
    process.env.JWT_REFRESH_SECRET || 'interskill_jwt_refresh_secret',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'interskill_jwt_secret');
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'interskill_jwt_refresh_secret');
};
