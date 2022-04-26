// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please Write Your Name!'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please Write Your City!'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please Write Your Phone!'],
    },
    picture: {
      type: String,
      // required: [true, "Please Write Add the Boy Image!"],
      trim: true,
    },
    age: Number,
    reportDate: {
      type: Date,
      default: Date.now(),
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'Users',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reportSchema.pre('save', function (next) {
  this.city = this.city.toLowerCase();
  // console.log(this.city)
  next();
});

reportSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});
const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
