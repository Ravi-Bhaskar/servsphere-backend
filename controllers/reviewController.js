const Review = require("../models/Review");
const Service = require("../models/Service");

//POST : Add Review
const addReview = async (req, res) => {
    const { rating, comment } = req.body;
    const serviceId = req.params.id;
    const userId = req.user._id;

    const existingReview = await Review.findOne({ service: serviceId, user: userId });
    if(existingReview) {
        return res.status(400).json({ message: "You have already reviewed this service." });
    }

    const review = await Review.create({
        user: userId,
        service: serviceId,
        rating,
        comment,
    });

    const reviews = await Review.find({ service: serviceId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await Service.findByIdAndUpdate(serviceId, {
        rating: avgRating,
        reviewsCount: reviews.length,
    });

    res.status(201).json(review);
};

//GET: All Reviews for a Service
const getServiceReviews = async (req, res) => {
    const reviews = await Review.find({ service: req.params.id }).populate("user", "name");
    res.json(reviews);
};

module.exports = { addReview, getServiceReviews };