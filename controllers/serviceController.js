const Service = require("../models/Service");
const Booking = require("../models/Booking");

//Create a new service
exports.createService = async (req, res) => {
  const { title, category, pinCode, description, price, experience, serviceProvider, date, time } = req.body;

  const photoFilenames = req.files?.map((file) => file.filename) || [];

  try {
    // Check if the service provider already has a booking at the same time
    const existingBooking = await Booking.findOne({
      serviceProvider,
      date,
      time,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingBooking) {
      return res.status(409).json({ message: "Time slot already booked by the service provider" });
    }

    // Create a new service
    const newService = new Service({
      title,
      category,
      pinCode,
      description,
      price,
      experience,
      servicePhoto: photoFilenames,
      serviceProvider,
    });

    await newService.save();

    res.status(201).json({
      message: "New service created successfully",
      service: newService,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({
      message: "Failed to create service",
      error: error.message,
    });
  }
};

//Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate("serviceProvider", "name email photo");
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching services",
      error: error.message,
    });
  }
};

exports.getMyServices = async (req, res) => {
  try {
    const providerId = req.user._id;

    const myServices = await Service.find({ serviceProvider: providerId });

    res.status(200).json(myServices);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Failed to get services" });
  }
}

// GET /services?category=maid&pinCode=123456
exports.getServicesbySearch = async (req, res) => {
  try {
    const { category, pinCode, page = 1, limit = 6 } = req.query;
    let query = {};

    if (category) query.category = category;
    if (pinCode) query.pinCode = parseInt(pinCode); // ensure number

    const total = await Service.countDocuments(query);
    const services = await Service.find(query).populate("serviceProvider", "name email photo").skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({ 
      services, 
      totalPages: Math.ceil(total / limit), 
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get services by category
exports.getServicesByCategory = async (req, res) => {
  try {
      const { category } = req.params;
      const services = await Service.find({ category }).populate("serviceProvider", "name email photo");
      const serviceCount = services.length;
      res.status(200).json({ serviceCount, services });
  } catch (err) {
      res.status(500).json({ message: 'Error fetching category services' });
  }
};

exports.getServicesCategoryCount = async (req, res) => {
  try {
    const services = await Service.find();
    const counts = {};

    services.forEach(service => {
      const key = service.category.toLowerCase().replace(/\s/g, "-");
      counts[key] = (counts[key] || 0) + 1;
    });

    res.json({ counts });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

//Get service by id
exports.getServiceById = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await Service.findById(id).populate(
      "serviceProvider",
      "-password"
    );
    if (!service)
      return res.status(404).json({
        message: "Service not found",
      });

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: "Error fetching service" });
  }
};

//Update a service
exports.updateService = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    category,
    pinCode,
    description,
    price,
    experience,
    available,
  } = req.body;

  // Handle uploaded images (if any)
  let newPhotos = [];
  if (req.files && req.files.length > 0) {
    newPhotos = req.files.map((file) => file.filename); // adjust if storing full URL
  }

  try {
    const existingService = await Service.findById(id);
    if (!existingService) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Merge new photos with existing if desired
    const updatedPhotos = [...existingService.servicePhoto, ...newPhotos];

    const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        title,
        category,
        pinCode,
        description,
        price,
        experience,
        available,
        servicePhoto: updatedPhotos,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Service updated successfully",
      updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({
      message: "Error updating service",
    });
  }
};

//Delete a service
exports.deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await Service.findByIdAndDelete(id);
    if (!service)
      return res.status(404).json({
        message: "Service not found",
      });

    res.status(200).json({
      message: "Service deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting service",
    });
  }
};
