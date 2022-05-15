const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const ApiError = require('../utils/apiError');
const factory = require('./handlerFactory');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// filter requests body
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.createUser = factory.createOne(User);

exports.getUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new ApiError(`No User for this id${req.params.id}`, 400));
  }
  res.status(200).json({ data: user });
});

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const filtrObj = filterObj(req.body, 'phone', 'email', 'profileImg');
  const user = await User.findByIdAndUpdate(req.user._id, filtrObj, {
    new: true,
  });
  res.status(200).json({ data: user });
});

/*  @desc   Update Logged user data
    @route  PUT   /api/v1/users/updateMyPassword
    @access Private/protect  
*/
exports.updateLoggedUserPassowrd = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  const token = generateToken(user._id, process.env.JWT_EXPIRE_TIME);
  res.status(200).json({ data: user, token });
});

exports.getmatrics = asyncHandler(async (req, res) => {
  // EXECUTE QUERY
  const users = await User.find({ role: 'user' }).select('fingerprint');
  console.log(users);
  res.status(200).json({
    users,
  });
});

exports.getUniqueID = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ApiError('User not found', 404));
  const uniqueID = `${req.user._id}-${uuidv4()}`;
  user.uniqueID = uniqueID;
  user.save();
  res.status(201).json({ uniqueID });
});
exports.searchByUniqueID = asyncHandler(async (req, res, next) => {
  const user = await User.find({ uniqueID: req.params.UniqueID });
  if (!user) return next(new ApiError('User not found', 404));
  res.status(201).json({ user });
});

exports.setRoleAdmin = asyncHandler(async (req, res, next) => {
  req.body.role = 'admin';
  next();
});
exports.setRoleUser = asyncHandler(async (req, res, next) => {
  req.body.role = 'user';
  next();
});
