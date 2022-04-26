const express = require('express');

const {
  getReport,
  getReports,
  updateReport,
  deleteReport,
  createReport,
  uploadReportImage,
  resizeReportImage,
} = require('../controllers/reportController');

const {
  UpdateReportValidator,
  deleteReportValidator,
} = require('../utils/validators/reportValidator');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(getReports)
  .post(protect, uploadReportImage, resizeReportImage, createReport);
router
  .route('/:id')
  .get(getReport)
  .put(
    protect,
    UpdateReportValidator,
    uploadReportImage,
    resizeReportImage,
    updateReport
  )
  .delete(protect, deleteReportValidator, deleteReport);

// router.patch('/changePassword/:id', changeUserPassword);

module.exports = router;
