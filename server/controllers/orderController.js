const Order = require("../models/Order");
const Product = require("../models/Product");
const Settings = require("../models/Settings");
const { getRecommendations } = require("../utils/recommendations");
const { buildWhatsAppLink, sendOrderEmail, sendWhatsAppCloudNotification } = require("../utils/orderNotifications");
const { memoryStore } = require("../data/memoryStore");
const mongoose = require("mongoose");
const { calculateOrderTotals } = require("../utils/pricing");

const statusTransitions = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Preparing", "Cancelled"],
  Preparing: ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: []
};

function canCancelOrder(order) {
  return !["Out for Delivery", "Delivered", "Cancelled"].includes(order.status);
}

async function createOrder(req, res) {
  const orderTime = req.body.orderTime || new Date().toISOString();
  const orderId = `RB${Date.now().toString().slice(-6)}`;
  const settings = memoryStore.dbConnected
    ? (await Settings.findOne()) || { gstEnabled: false, gstRate: 18 }
    : memoryStore.settings;
  const pricing = calculateOrderTotals(req.body.items || [], settings);
  const payload = {
    ...req.body,
    status: req.body.status || "Pending",
    orderId,
    orderTime,
    subtotal: pricing.subtotal,
    deliveryCharge: pricing.deliveryCharge,
    gstEnabled: pricing.gstEnabled,
    gstRate: pricing.gstRate,
    gstAmount: pricing.gstAmount,
    total: pricing.total
  };

  const order = memoryStore.dbConnected
    ? await Order.create(payload)
    : { ...payload, _id: `memory-order-${Date.now()}` };

  if (!memoryStore.dbConnected) {
    memoryStore.orders.unshift(order);
  }

  const whatsappUrl = buildWhatsAppLink(order);
  let emailSent = false;
  let whatsappSent = false;

  try {
    const emailStatus = await sendOrderEmail(order);
    emailSent = !emailStatus.skipped;
  } catch (error) {
    console.error("Order email failed", error.message);
  }

  try {
    const whatsappStatus = await sendWhatsAppCloudNotification(order);
    whatsappSent = !whatsappStatus.skipped;
  } catch (error) {
    console.error("WhatsApp notification failed", error.message);
  }

  return res.status(201).json({
    message: "Order saved and notifications processed",
    order,
    whatsappUrl,
    emailSent,
    whatsappSent
  });
}

async function getOrders(req, res) {
  const requestedPhone = req.query.phone?.trim();
  const isAdmin = ["admin", "superadmin"].includes(req.user?.role || "");
  const isCustomer = req.user?.role === "customer";

  if (!isAdmin && !isCustomer) {
    return res.status(401).json({ message: "Login required to view orders" });
  }

  const phone = isCustomer ? req.user.phone : requestedPhone;
  const filter = phone ? { phone } : {};

  const orders = memoryStore.dbConnected
    ? await Order.find(filter).sort({ createdAt: -1 })
    : memoryStore.orders
        .filter((order) => (phone ? order.phone === phone : true))
        .sort((a, b) => new Date(b.orderTime || b.createdAt || 0) - new Date(a.orderTime || a.createdAt || 0));

  return res.json(orders);
}

async function cancelOrder(req, res) {
  const orderId = req.params.orderId || req.params.id;
  const { reason, cancelledBy = "customer" } = req.body;

  if (!reason?.trim()) {
    return res.status(400).json({ message: "Cancel reason is required" });
  }

  const orderLookup = mongoose.Types.ObjectId.isValid(orderId)
    ? { $or: [{ _id: orderId }, { orderId }] }
    : { orderId };

  const order = memoryStore.dbConnected
    ? await Order.findOne(orderLookup)
    : memoryStore.orders.find((item) => item.orderId === orderId || item._id === orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (req.user?.role === "customer" && order.phone !== req.user.phone) {
    return res.status(403).json({ message: "You can only cancel your own orders" });
  }

  if (!canCancelOrder(order)) {
    return res.status(400).json({ message: "This order can no longer be cancelled" });
  }

  const updates = {
    status: "Cancelled",
    cancelReason: reason.trim(),
    cancelledAt: new Date(),
    cancelledBy
  };

  const updatedOrder = memoryStore.dbConnected
    ? await Order.findOneAndUpdate(orderLookup, updates, { new: true })
    : Object.assign(order, updates);

  return res.json({
    message: "Order cancelled successfully",
    order: updatedOrder
  });
}

async function updateOrderStatus(req, res) {
  const orderId = req.params.orderId || req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Order status is required" });
  }

  if (status === "Cancelled") {
    return res.status(400).json({ message: "Use the cancel order API to cancel this order" });
  }

  const orderLookup = mongoose.Types.ObjectId.isValid(orderId)
    ? { $or: [{ _id: orderId }, { orderId }] }
    : { orderId };

  const order = memoryStore.dbConnected
    ? await Order.findOne(orderLookup)
    : memoryStore.orders.find((item) => item.orderId === orderId || item._id === orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const allowedTransitions = statusTransitions[order.status] || [];

  if (!allowedTransitions.includes(status)) {
    return res.status(400).json({ message: `Order cannot move from ${order.status} to ${status}` });
  }

  const updates = {
    status,
    ...(status !== "Cancelled"
      ? {
          cancelReason: "",
          cancelledAt: null,
          cancelledBy: ""
        }
      : {})
  };

  const updatedOrder = memoryStore.dbConnected
    ? await Order.findOneAndUpdate(orderLookup, updates, { new: true })
    : Object.assign(order, updates);

  return res.json({
    message: "Order status updated successfully",
    order: updatedOrder
  });
}

async function getRecommendationsForUser(req, res) {
  const products = memoryStore.dbConnected ? await Product.find() : memoryStore.products;
  const recentOrders = memoryStore.dbConnected
    ? await Order.find({ phone: req.query.phone }).sort({ createdAt: -1 }).limit(5)
    : memoryStore.orders.filter((order) => order.phone === req.query.phone).slice(0, 5);
  const behaviorTags = (req.query.behavior || "").split(",").filter(Boolean);
  const recommendations = getRecommendations(products, recentOrders, behaviorTags);
  return res.json(recommendations);
}

module.exports = { createOrder, getOrders, cancelOrder, updateOrderStatus, getRecommendationsForUser };
