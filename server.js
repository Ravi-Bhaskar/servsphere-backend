const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require("./routes/reviewRoutes");
const path = require('path');

dotenv.config();
const app = express();

//middleware
app.use(cors({
    origin: ["https://servsphere.vercel.app"]
}));
app.use(express.json());

//connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use("/images", express.static(path.join(__dirname, 'public/images')));
app.use("/service-images",express.static(path.join(__dirname, 'public/service-images')));


//Start Server on port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
