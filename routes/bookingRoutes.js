const express = require('express');
const { createBooking, getBookingsByUser, getBookingsByProvider, updateBookingStatus, cancelBooking, updatePaymentStatus } = require('../controllers/bookingController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();


// POST a new booking
router.post("/", protect, authorizeRoles('user'), createBooking);

// GET bookings by user ID
router.get("/user/:userId", protect, authorizeRoles('user'), getBookingsByUser);

// GET bookings by service provider ID
router.get("/provider/:providerId", protect, authorizeRoles('service_provider'), getBookingsByProvider);

// PUT to update booking status
router.put("/status/:id", protect, authorizeRoles('service_provider'), updateBookingStatus);

// Cancel Booking
router.put('/cancel/:id', protect, cancelBooking);

//Update Payment status
router.put('/payment/:id', protect, authorizeRoles('admin', 'service_provider'), updatePaymentStatus);

module.exports = router;