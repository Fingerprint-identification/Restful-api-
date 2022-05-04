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
  getUniqueID,
  setRoleAdmin,
  setRoleUser,
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
router.get('/getUniqueID', getUniqueID);

router.put('/updateMyData', updateLoggedUserValidator, updateLoggedUserData);

router.patch(
  '/updateMyPassword',
  changeLoggedPasswordValidator,
  updateLoggedUserPassowrd
);

// create Admin
router
  .route('/owner')
  .get(restrictTo('onwer'), getUsers)
  .post(restrictTo('onwer'), setRoleAdmin, createUser);

router.use(restrictTo('admin', 'onwer'));

// create user
router
  .route('/')
  .get(getUsers)
  .post(createUserValidator, setRoleUser, createUser);
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
