const mongoose = require("mongoose");

const serviceSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "maid",
        "electrician",
        "plumber",
        "carpenter",
        "ac-repair",
        "pest-control",
        "car-wash",
        "tuition",
        "baby-sitting",
        "home-cleaning",
        "tank-cleaning",
        "mechanic",
        "cooking",
        "painter",
        "salon",
      ],
      required: true,
    },
    pinCode: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    experience: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    servicePhoto: {
      type: [],
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    available: {
      type: Boolean,
      default: true,
    },
    serviceProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;
