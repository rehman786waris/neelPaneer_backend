const express = require('express');
const authController = require('../controllers/authController');
const upload = require("../utils/cloudinary");
const authenticate = require('../middlewares/authMiddleware'); // ✅ This was missing
const router = express.Router();

router.post('/create', upload.single("profileImage"), authController.signup); // full signup
router.post("/login", authController.login);
router.get('/allUsers', authenticate,authController.getAllUsers); // get all users
router.get('/user/:id', authenticate,authController.getUserById);
router.delete('/user/:id', authenticate,authController.deleteUserById);
router.put("/user/:id", authenticate,upload.single("profileImage"), authController.updateUserById);



module.exports = router;
