const express = require('express');

const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  changeUserPassword,
  deleteUser,
  getLoggedUserData,
  updateLoggedUserData,
  updateLoggedUserPassowrd,
  getmatrics,
} = require('../controllers/userController');
const {
  createUserValidator,
  getUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateUserValidator,
  updateLoggedUserValidator,
  changeLoggedPasswordValidator,
} = require('../utils/validators/userValidator');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.get('/matricsOfFinger', getmatrics);

router.use(protect);
router.get('/getMe', getLoggedUserData, getUser);

router.put('/updateMyData', updateLoggedUserValidator, updateLoggedUserData);

router.patch(
  '/updateMyPassword',
  changeLoggedPasswordValidator,
  updateLoggedUserPassowrd
);

router.use(restrictTo('admin'));

// router.route('/national/:nationalId').get(getUser);

router.route('/').get(getUsers).post(createUserValidator, createUser);
router
  .route('/:id')
  .get(getUserValidator, getUser)
  .put(updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

router.patch(
  '/changePassword/:id',
  changeUserPasswordValidator,
  changeUserPassword
);

module.exports = router;
