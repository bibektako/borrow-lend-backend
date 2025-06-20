const express = require("express");
const router = express.Router();
const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  verifyItem
} = require("../controllers/itemsManagement");

const { authenticateUser, isAdmin } = require("../middlewares/authorizedUser"); 
const upload = require("../middlewares/uploadMiddleware"); 


router.get("/", getAllItems);
router.get("/:id", getItemById);


router.post("/", authenticateUser, upload.array('imageUrls', 5), createItem);
router.put("/:id", authenticateUser, updateItem);
router.delete("/:id", authenticateUser, deleteItem);


router.patch("/:id/verify", authenticateUser, isAdmin, verifyItem);

module.exports = router;