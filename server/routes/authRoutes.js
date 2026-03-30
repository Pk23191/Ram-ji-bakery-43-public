const express = require("express");
const { login, customerLogin } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.post("/customer-login", customerLogin);

module.exports = router;
