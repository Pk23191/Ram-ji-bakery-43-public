require("dotenv").config();
const connectDB = require("../config/db");
const Product = require("../models/Product");
const Admin = require("../models/Admin");
const { products, buildSeedAdmin } = require("./seedData");

async function seed() {
  await connectDB();
  await Product.deleteMany();
  await Admin.deleteMany();
  await Product.insertMany(products);
  await Admin.create(await buildSeedAdmin());
  console.log("Seed data inserted");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
