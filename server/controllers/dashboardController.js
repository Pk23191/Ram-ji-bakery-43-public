const Order = require("../models/Order");
const { memoryStore } = require("../data/memoryStore");

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function isSalesOrder(order) {
  return order.status !== "Cancelled";
}

function buildMetrics(orders = []) {
  const today = startOfToday();
  const month = startOfMonth();
  const salesOrders = orders.filter(isSalesOrder);

  const totalSales = salesOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const todaySales = salesOrders
    .filter((order) => new Date(order.createdAt || order.orderTime || Date.now()) >= today)
    .reduce((sum, order) => sum + Number(order.total || 0), 0);
  const monthlySales = salesOrders
    .filter((order) => new Date(order.createdAt || order.orderTime || Date.now()) >= month)
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const chartMap = new Map();
  salesOrders.forEach((order) => {
    const key = new Date(order.createdAt || order.orderTime || Date.now()).toISOString().slice(0, 10);
    chartMap.set(key, (chartMap.get(key) || 0) + Number(order.total || 0));
  });

  const salesByDay = [...chartMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, sales]) => ({ date, sales }));

  return {
    totalSales,
    todaySales,
    monthlySales,
    totalOrders: orders.length,
    salesByDay
  };
}

async function getDashboardStats(req, res) {
  const orders = memoryStore.dbConnected
    ? await Order.find().sort({ createdAt: -1 })
    : [...memoryStore.orders];

  return res.json(buildMetrics(orders));
}

module.exports = {
  getDashboardStats
};
