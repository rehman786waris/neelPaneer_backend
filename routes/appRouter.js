const express = require('express');
const authController = require('../controllers/authController');
const bannerController = require('../controllers/bannerController');
const productController = require('../controllers/productController');
const favouriteController = require('../controllers/favouriteController');
const bookingController = require('../controllers/bookingController');
const orderController = require('../controllers/orderController');
const restaurantController = require('../controllers/restaurantController');
const summaryController = require('../controllers/summaryController');
const notificationController = require('../controllers/notificationController');
const deviceController = require('../controllers/deviceController');
const paymentController = require('../controllers/paymentController');


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
router.put("/user/:id/status", authenticate, authController.enableAndDisable);
router.post('/verify-phone', authController.verifyUserByPhone);
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
router.get('/bookings/available-seats', authenticate, bookingController.checkAvailability);
router.get('/bookings/available-slots', authenticate, bookingController.getAvailableSlotsByDate);
router.get('/bookings', authenticate, bookingController.getAllBookings);
router.get('/bookings/:id', authenticate, bookingController.getBookingById); // ← move this after the specific ones
router.put('/bookings/:id', authenticate, bookingController.updateBooking);
router.delete('/bookings/:id', authenticate, bookingController.deleteBooking);




///Food orders
router.post('/orders', authenticate, orderController.createOrder);
router.get('/orders', authenticate, orderController.getAllOrders);
router.get('/orders/:id', authenticate, orderController.getOrderById);
router.put('/orders/:id', authenticate, orderController.updateOrder);
router.delete('/orders/:id', authenticate, orderController.deleteOrder);
router.patch('/orders/:id/status', authenticate, orderController.updateOrderStatus);

/// Payment reports
router.post('/payments', authenticate, paymentController.createPayment);
router.get('/reports', authenticate, paymentController.getAllReports);
router.get('/reports/:id', authenticate, paymentController.getReportById);
router.put('/reports/:id', authenticate, paymentController.updateReport);
router.delete('/reports/:id', authenticate, paymentController.deleteReport);


/// Restaurant
router.post("/restaurants", authenticate, restaurantController.createRestaurant);
router.get("/restaurants", authenticate, restaurantController.getAllRestaurants);
router.get("/restaurants/:id", authenticate, restaurantController.getRestaurantById);
router.put("/restaurants/:id", authenticate, restaurantController.updateRestaurant);
router.delete("/restaurants/:id", authenticate, restaurantController.deleteRestaurant);
router.patch("/restaurants/:id/status", authenticate, restaurantController.updateRestaurantStatus);

/// Today summary
router.get('/dashboard/summary', authenticate, summaryController.getSummary);

// Push Notification 
router.post("/send-notification", authenticate, notificationController.sendNotification);
router.post('/notification', authenticate, notificationController.createNotification);
router.get('/notification', authenticate, notificationController.getAllNotifications);
router.get('/notification/:id', authenticate, notificationController.getNotificationById);
router.put('/notification/:id/mark-read', authenticate, notificationController.markAsRead);
router.put('/notification/mark-all-read', authenticate, notificationController.markAllAsRead);
router.delete('/notification/:id', authenticate, notificationController.deleteNotification);
router.delete('/notification', authenticate, notificationController.deleteAllNotifications);


router.post('/device', authenticate, deviceController.createDevice);
router.get('/device', authenticate, deviceController.getAllDevices);
router.get('/device/:id', authenticate, deviceController.getDeviceById);
router.put('/device/:id', authenticate, deviceController.updateDevice);
router.delete('/device/:id', authenticate, deviceController.deleteDevice);



module.exports = router;
