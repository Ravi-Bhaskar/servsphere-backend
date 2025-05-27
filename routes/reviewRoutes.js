const express = require('express');
const { addReview, getServiceReviews } = require('../controllers/reviewController');
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");


router.post("/service/:id", protect, addReview);
router.get("/service/:id", getServiceReviews);

module.exports = router;