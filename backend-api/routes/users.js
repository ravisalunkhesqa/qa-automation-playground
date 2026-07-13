const express = require("express");

const router = express.Router();

const users = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith"
  }
];

router.get("/", (req, res) => {
  res.json(users);
});

module.exports = router;