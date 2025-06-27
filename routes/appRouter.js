const express = require('express');
const authController = require('../controllers/authController');
bannerController = require('../controllers/bannerController'); // ✅ fixed here
const productController = require('../controllers/productController');
const favouriteController = require('../controllers/favouriteController');
const bookingController = require('../controllers/bookingController');
const orderController = require('../controllers/orderController');




const uploads = require("../utils/cloudinary");
const upload = require("../middlewares/bannerMiddleware");
const authenticate = require('../middlewares/authMiddleware');
const router = express.Router();

/// Auth routes
router.post('/create', uploads.single("profileImage"), authController.signup);
router.post("/login", authController.login);
router.get('/allUsers', authenticate, authController.getAllUsers);
router.get('/user/:id', authenticate, authController.getUserById);
router.delete('/user/:id', authenticate, authController.deleteUserById);
router.put("/user/:id", authenticate, uploads.single("profileImage"), authController.updateUserById);

/// Banner routes
router.post("/banners", authenticate, upload.array("bannerImages", 10), bannerController.createBanner);
router.get("/banners", authenticate, bannerController.getAllBanners);
router.get("/banners/:id", authenticate, bannerController.getBannerById);
router.put("/banners/:id", authenticate, upload.array("bannerImages", 10), bannerController.updateBanner);
router.delete("/banners/:id", authenticate, bannerController.deleteBanner);

///Products routes
router.post('/products', authenticate, upload.single("productImage"), productController.createProduct);
router.get('/products', authenticate, productController.getAllProducts); // optional ?productCategory=starter&timeTag=brunch
router.get('/products/:id', authenticate, productController.getProductById);
router.put('/products/:id', authenticate, upload.single("productImage"), productController.updateProduct);
router.delete('/products/:id', authenticate, productController.deleteProduct);


///Favourite products 
router.post('/favourites', authenticate, favouriteController.addFavourite);
router.delete('/favourites/:productId', authenticate, favouriteController.removeFavourite);
router.get('/favourites', authenticate, favouriteController.getFavourites);

///Booking table
router.post('/bookings', authenticate, bookingController.createBooking);
router.get('/bookings', authenticate, bookingController.getAllBookings);
router.get('/bookings/:id', authenticate, bookingController.getBookingById);
router.put('/bookings/:id', authenticate, bookingController.updateBooking);
router.delete('/bookings/:id', authenticate, bookingController.deleteBooking);

///Food orders
router.post('/orders', authenticate, orderController.createOrder);
router.get('/orders', authenticate, orderController.getAllOrders);
router.get('/orders/:id', authenticate, orderController.getOrderById);
router.put('/orders/:id', authenticate, orderController.updateOrder);
router.delete('/orders/:id', authenticate, orderController.deleteOrder);



module.exports = router;
