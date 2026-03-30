const express = require("express");
const {
  createOrder,
  getOrders,
  cancelOrder,
  updateOrderStatus,
  getRecommendationsForUser
} = require("../controllers/orderController");
const auth = require("../middleware/auth");
const adminMiddleware = require("../middleware/adminMiddleware");
const optionalAuth = require("../middleware/optionalAuth");

const router = express.Router();

router.post("/order", createOrder);
router.patch("/order/:orderId/cancel", optionalAuth, cancelOrder);
router.get("/orders", optionalAuth, getOrders);
router.put("/orders/:id/cancel", optionalAuth, cancelOrder);
router.put("/orders/:id/status", auth, adminMiddleware, updateOrderStatus);
router.get("/recommendations", getRecommendationsForUser);

module.exports = router;
