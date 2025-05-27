const express = require('express');
const { registerUser, loginUser, getUserProfile, getAllUsers, updateProfile } = require('../controllers/authController');
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb) {
        cb(null, `image-${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
        cb(null, true);
    } else {
        cb(null, false);
        return cb(new Error("Only jpg, png, and jpeg formats are allowed"));
    }
};

let upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter,
});


router.post('/register', upload.single("photo"), registerUser);
router.post('/login', loginUser);
router.get('/all-users', protect, authorizeRoles('admin'), getAllUsers);
router.get("/profile", protect, getUserProfile);
router.put("/update-profile", protect, upload.single("photo"), updateProfile);

module.exports = router;