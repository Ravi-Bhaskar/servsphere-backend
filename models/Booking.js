const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  additionalInfo: { 
    type: String 
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String },
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "refunded"],
    default: "unpaid",
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "online"],
    default: "cash",
  },
  isReviewed: {
    type: Boolean,
    default: false,
  },
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
