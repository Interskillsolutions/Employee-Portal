import AuthService from '../services/authService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.loginUser({ email, password });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      'User logged in successfully'
    )
  );
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const tokens = await AuthService.refreshToken(token);

  res.status(200).json(
    new ApiResponse(200, tokens, 'Token refreshed successfully')
  );
});

export const logout = asyncHandler(async (req, res) => {
  await AuthService.logoutUser(req.user._id);

  res.status(200).json(
    new ApiResponse(200, null, 'User logged out successfully')
  );
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await AuthService.getUserProfile(req.user._id);

  res.status(200).json(
    new ApiResponse(200, { user }, 'Current user profile fetched successfully')
  );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await AuthService.updateUserProfile(req.user._id, req.body);

  res.status(200).json(
    new ApiResponse(200, { user: updatedUser }, 'Profile updated successfully')
  );
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await AuthService.changePassword(req.user._id, { currentPassword, newPassword });

  res.status(200).json(
    new ApiResponse(200, null, result.message)
  );
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);

  res.status(200).json(
    new ApiResponse(200, result, result.message)
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const result = await AuthService.resetPassword(token, password);

  res.status(200).json(
    new ApiResponse(200, null, result.message)
  );
});
