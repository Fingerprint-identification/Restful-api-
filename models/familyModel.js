// const crypto = require('crypto');
const mongoose = require('mongoose');

const familySchema = new mongoose.Schema(
  {
    mother_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Users',
    },
    father_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Users',
    },
    child: {
      type: mongoose.Schema.ObjectId,
      ref: 'Users',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
familySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'mother_id',
    select: '-fingerprint ',
  })
    .populate({
      path: 'father_id',
      select: '-fingerprint',
    })
    .populate({
      path: 'child',
      select: '-fingerprint',
    });
  next();
});
const family = mongoose.model('Family', familySchema);
module.exports = family;
