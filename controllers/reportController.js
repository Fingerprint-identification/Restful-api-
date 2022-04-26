const asyncHandler = require('express-async-handler');
const sharp = require('sharp');
const cloudinary = require('cloudinary');
const { v4: uuidv4 } = require('uuid');

const factory = require('./handlerFactory');
const Report = require('../models/reportModel');

const { uploadSingleImage } = require('../middlewares/uploadImageMiddelware');

cloudinary.config({
  cloud_name: 'dmi3nddpp',
  api_key: '284572436426526',
  api_secret: 'Y8ZBqVB0f5BvUwFRiE0fGVerqr4',
  secure: true,
});

// uploads a single image
exports.uploadReportImage = uploadSingleImage('picture');

// image processing

exports.resizeReportImage = asyncHandler(async (req, res, next) => {
  const filename = `reports-${uuidv4()}-${Date.now()}.webp`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('webp')
    .webp({ quality: 85 })
    .toFile(`uploads/reports/${filename}`);

  await cloudinary.v2.uploader.upload(
    `uploads/reports/${filename}`,
    { public_id: filename },
    (error, result) => {
      req.body.picture = result.secure_url;
      req.body.user = req.user_id;
    }
  );

  next();
});

exports.createReport = factory.createOne(Report);

exports.getReports = factory.getAll(Report);

exports.getReport = factory.getOne(Report);

exports.updateReport = factory.updateOne(Report);

exports.deleteReport = factory.deleteOne(Report);
