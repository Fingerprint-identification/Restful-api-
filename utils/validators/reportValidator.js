const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddelware');
const Report = require('../../models/reportModel');

exports.getReviewValidator = [
  check('id').isMongoId().withMessage('Invalid Report ID Format'),
  validatorMiddleware,
];

exports.createReviewValidator = [];

exports.UpdateReportValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Report ID Format')
    .custom((val, { req }) =>
      // Check review ownership before update
      Report.findById(val).then((report) => {
        if (!report) {
          return Promise.reject(new Error(`There is no report with id ${val}`));
        }

        if (report.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`Your are not allowed to perform this action`)
          );
        }
      })
    ),
  validatorMiddleware,
];
exports.deleteReportValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Report id format')
    .custom((val, { req }) => {
      // Check review ownership before update
      if (req.user.role === 'user') {
        return Report.findById(val).then((report) => {
          if (!report) {
            return Promise.reject(
              new Error(`There is no report with id ${val}`)
            );
          }
          if (report.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error(`Your are not allowed to perform this action`)
            );
          }
        });
      }
      return true;
    }),
  validatorMiddleware,
];
