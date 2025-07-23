const express = require("express");
const router = express.Router();

const { getNotifications, markAsRead } =
  require("../controllers/notification_controller.js");

const { authenticateUser } = require("../middlewares/authorizedUser.js")

router.get("/", authenticateUser, getNotifications);
router.patch("/read", authenticateUser, markAsRead);

module.exports = router;
