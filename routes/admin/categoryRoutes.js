const express = require("express");
const router = express.Router();

const categoryController = require("../../controllers/admin/categoryManagement");
const upload = require("../../middlewares/uploadMiddleware")
const {
  authenticateUser,
  isAdmin,
} = require("../../middlewares/authorizedUser");

router.get("/", categoryController.getAllCategories);

router.get("/:id", categoryController.getCategoryById);

router.post("/", authenticateUser, isAdmin,upload.single("image"), categoryController.createCategory);

router.put(
  "/:id",
  authenticateUser,
  isAdmin,
  upload.single("image"),
  categoryController.updateCategory
);
router.delete(
  "/:id",
  authenticateUser,
  isAdmin,
  categoryController.deleteCategory
);

module.exports = router;
