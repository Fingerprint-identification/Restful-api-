const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const User = require('../models/userModel');
// const sendEmail = require('../utils/email');
const SMS = require('../utils/sms');
const { sanitizeUser } = require('../utils/sentinizeData');
const generateToken = require('../utils/generateToken');

/*  @desc   Login User Account With National ID
    @route  Post /api/v1/auth/login
    @access Public  
*/

exports.login = asyncHandler(async (req, res, next) => {
  // check user email & password is exist
  console.log(req.body);
  const user = await User.findOne({ national_id: req.body.national_id }).select(
    '+password'
  );
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError('Incorrect national_id or password', 401));
  }
  // generate token
  const token = generateToken(user._id, process.env.JWT_EXPIRE_TIME);
  user.token = token;
  user.save();
  // console.log(user);
  res.status(200).json({ data: sanitizeUser(user), token });
});

// @desc make sure user is authenticated
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) check if token is exist  if exist get token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log(token);
  if (!token) {
    return next(
      new ApiError('You are not authenticated, Please login again', 401)
    );
  }
  // 2) verify token (no change ,expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // 3) check if user exist
  const currentUser = await User.findById(decoded.userId).select('-password');
  if (!currentUser) {
    return next(
      new ApiError(
        'The user that belong to this token does no longer exist',
        401
      )
    );
  }
  // // 4) check if user is active or not active
  // if (!currentUser.active) {
  //   return next(new ApiError('The user not active ', 401));
  // }
  // 5) check if user change password after token created
  if (currentUser.passwordChangedAt) {
    const passChangetimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passChangetimestamp > decoded.iat) {
      return next(
        new ApiError('User recently changed password, Please login again.', 401)
      );
    }
  }

  req.user = currentUser;
  next();
});

// @desc user permission
exports.restrictTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('You do not have permission to perform this action', 403)
      );
    }

    next();
  });

/*  @desc   Forgot password User Account With Email
    @route  Post /api/v1/auth/forgotPassword
    @access Public  
*/
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get User body
  const user = await User.findOne({ phone: req.body.phone });
  if (!user) {
    return next(
      new ApiError(`there is no user with this Phone ID ${req.body.phone}`, 404)
    );
  }
  // 2) if user exist generate reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');
  // Save hashedCode in Db
  user.passwordResetCode = hashedCode;
  // Add expiration code time for reset reset code
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();
  // 3) Send the reset code vai email
  const message = `Hi ${user.name},\n We received a request to reset the password on your Fingerprint Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The Support Team`;
  try {
    await new SMS(message, user.phone).send();
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError(`there is an error in sending SMS`, 500));
  }

  res
    .status(200)
    .json({ status: 'Success', message: 'Reset code sent to your Phone' });
});

// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError('Reset code invalid or expired'));
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();
  const token = generateToken(user._id, process.env.EXPIRE_TIME_RESET_CODE);
  res.status(200).json({
    status: 'Success',
    token,
  });
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  console.log('newPassword', req.body);
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(
      new ApiError(`There is no user with phone ${req.user.phone}`, 404)
    );
  }

  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError('Reset code not verified', 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) if everything is ok, generate token
  const token = generateToken(user._id, process.env.JWT_EXPIRE_TIME);
  res.status(200).json({ token });
});
