const express = require("express");
const { assertOwnerContactConfigured } = require("../utils/ownerContact");

const router = express.Router();

router.get("/", (req, res) => {
  const { phone, email } = assertOwnerContactConfigured();
  res.json({ phone, email });
});

module.exports = router;
