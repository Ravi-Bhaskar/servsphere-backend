const Booking = require('../models/Booking');
const Service = require("../models/Service");

//Create a new booking
exports.createBooking = async (req, res) => {
    const {
      service,
      date,
      time,
      additionalInfo,
      location,
      paymentMethod,
    } = req.body;
  
    try {
      // Find the service to get the provider
      const serviceData = await Service.findById(service).populate("serviceProvider");
  
      if (!serviceData) {
        return res.status(404).json({ message: "Service not found" });
      }
  
      const serviceProvider = serviceData.serviceProvider._id;
  
      // Check if there's an existing booking for the provider at the same date/time
      const existingBooking = await Booking.findOne({
        serviceProvider,
        date,
        time,
        status: { $in: ["pending", "confirmed"] },
      });
  
      if (existingBooking) {
        return res.status(409).json({ message: "Time slot already booked" });
      }
  
      // Create the booking
      const newBooking = new Booking({
        user: req.user._id, // assuming authenticated user
        service,
        date,
        time,
        additionalInfo,
        location,
        paymentMethod,
        serviceProvider,
      });
  
      await newBooking.save();
  
      res.status(201).json({
        message: "Booking created successfully",
        booking: newBooking,
      });
    } catch (error) {
      console.error("Booking error:", error);
      res.status(500).json({
        message: "Failed to create booking",
        error: error.message,
      });
    }
  };

//Get all booking for a user
exports.getBookingsByUser = async (req, res) => {

    try {
        const bookings = await Booking.find({ user: req.params.userId })
      .populate("service")
      .populate("serviceProvider")
      .sort({ createdAt: -1 });
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings' });
    }
};

//Get bookings for a service provider
exports.getBookingsByProvider = async (req, res) => {

    try {
        const bookings = await Booking.find({ serviceProvider: req.params.providerId })
      .populate("service")
      .populate("user")
      .sort({ createdAt: -1 });
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching service provider bookings' });
    }
};

//Update booking status
exports.updateBookingStatus = async (req, res) => {

    try {
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
          );
        if(!updatedBooking) return res.status(404).json({
            message: 'Booking not found'
        });

        res.status(200).json({
            message: 'Booking updated successfully',
            updatedBooking,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating booking status' });
    }
};

//Cancel Booking
exports.cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const booking = await Booking.findById(bookingId);
    
        if (!booking) {
          return res.status(404).json({ message: 'Booking not found' });
        }
    
        // Authorization check
        const isAdmin = req.user.role === 'admin';
        const isOwner = booking.user.toString() === req.user._id.toString();
        const isProvider = booking.serviceProvider?.toString() === req.user._id.toString();
    
        if (!isAdmin && !isOwner && !isProvider) {
          return res.status(403).json({ message: 'Unauthorized to cancel this booking' });
        }
    
        // Prevent double cancellation
        if (booking.status === 'cancelled') {
          return res.status(400).json({ message: 'Booking already cancelled' });
        }
    
        booking.status = 'cancelled';
    
        // Optional: update paymentStatus if already paid
        if (booking.paymentStatus === 'paid') {
          booking.paymentStatus = 'refunded';
        }
    
        await booking.save();
    
        res.status(200).json({
          message: 'Booking cancelled successfully',
          booking,
        });
      } catch (error) {
        console.error('Cancel Booking Error:', error);
        res.status(500).json({ message: 'Error cancelling the booking' });
      }
};

//Update Payment status
exports.updatePaymentStatus = async (req, res) => {
    const { paymentStatus } = req.body;

  if (!["paid", "refunded", "unpaid"].includes(paymentStatus)) {
    return res.status(400).json({ message: "Invalid payment status" });
  }

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Access check: admin or service provider for this booking
    if (
      req.user.role !== "admin" &&
      (!booking.serviceProvider ||
        booking.serviceProvider.toString() !== req.user._id.toString())
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update payment status" });
    }

    booking.paymentStatus = paymentStatus;
    await booking.save();

    res.status(200).json({
      message: `Booking marked as ${paymentStatus}`,
      booking,
    });
  } catch (error) {
    console.error("Payment status update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
  };