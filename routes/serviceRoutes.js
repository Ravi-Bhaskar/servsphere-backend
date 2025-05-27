const express = require('express');
const { createService, getAllServices, getServiceById, updateService, deleteService, getServicesByCategory, getServicesbySearch, getMyServices, getServicesCategoryCount } = require('../controllers/serviceController');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const multer = require('multer');


// Storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/service-images"; // Ensure this path is correct
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `image-${Date.now()}-${file.originalname}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error("Only jpg, png, and jpeg formats are allowed"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});


// Protected routes (only service providers or admins can create/update/delete services)
router.post('/', protect, authorizeRoles('admin', 'service_provider'), upload.array("servicePhotos", 3), async (req, res) => {
  try {
    if (req.files.length > 3) {
      return res.status(400).json({ success: false, message: "You can upload a maximum of 3 images." });
    }

    await createService(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/my", protect, authorizeRoles('admin', 'service_provider'), getMyServices);
router.put('/:id', protect, authorizeRoles('admin', 'service_provider'), upload.array("servicePhotos", 3), updateService);
router.delete('/:id', protect, authorizeRoles('admin', 'service_provider'), deleteService);

// Public route
router.get('/', getServicesbySearch);
router.get('/', getAllServices);
router.get("/category-counts", getServicesCategoryCount);
router.get('/category/:category', getServicesByCategory)
router.get('/:id', getServiceById);

module.exports = router;