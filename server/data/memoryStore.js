const { products } = require("../utils/seedData");

const memoryStore = {
  dbConnected: false,
  products: [...products],
  orders: [],
  customers: [],
  reviews: [],
  settings: {
    gstEnabled: false,
    gstRate: 18
  },
  admins: [
    {
      email: process.env.ADMIN_EMAIL || "admin@ramjibakery.in",
      password: process.env.ADMIN_PASSWORD || "admin123",
      role: "superadmin"
    }
  ]
};

function setDbConnected(value) {
  memoryStore.dbConnected = value;
}

module.exports = {
  memoryStore,
  setDbConnected
};
