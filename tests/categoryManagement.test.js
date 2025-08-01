const request = require("supertest");
const express = require("express");
const fs = require("fs");
const categoryRouter = require("../routes/admin/categoryRoutes");
const Category = require("../models/Category");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

jest.mock("../models/Category");
jest.mock("../models/User");

jest.mock("fs");

jest.mock("jsonwebtoken");

jest.mock("../middlewares/uploadMiddleware", () => ({
  single: jest.fn((fieldName) => (req, res, next) => {
    if (req.headers["x-test-upload"] === "true") {
      req.file = {
        path: "public/uploads/mock-image.png",
        filename: "mock-image.png",
      };
    }
    next();
  }),
}));

const app = express();
app.use(express.json());
app.use("/api/categories", categoryRouter);

process.env.SECRET = "test-secret-key";

describe("Category Management API", () => {
  let mockAdmin, mockCategory, mockToken;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAdmin = { _id: "adminId123", role: "admin" };
    mockToken = "valid-admin-token";
    mockCategory = {
      _id: "catId123",
      name: "Electronics",
      imageUrl: "public/uploads/electronics.png",
    };

    jwt.verify.mockReturnValue({ _id: mockAdmin._id });
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockAdmin),
    });
  });

  describe("GET /api/categories", () => {
    test("should fetch all categories successfully", async () => {
      Category.find.mockResolvedValue([mockCategory]);

      const res = await request(app).get("/api/categories");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].name).toBe(mockCategory.name);
    });
  });

  describe("GET /api/categories/:id", () => {
    test("should fetch a single category by ID", async () => {
      Category.findById.mockResolvedValue(mockCategory);

      const res = await request(app).get(`/api/categories/${mockCategory._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(mockCategory._id);
    });

    test("should return 404 if category is not found", async () => {
      Category.findById.mockResolvedValue(null);
      const res = await request(app).get("/api/categories/nonexistentId");
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Category not found");
    });
  });

  describe("POST /api/categories", () => {
    test("should fail with 403 if user is not an admin", async () => {
      const nonAdmin = { _id: "userId456", role: "normal" };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(nonAdmin),
      });

      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ name: "Attempt" });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Forbidden: Admin privilege required.");
    });
  });

  describe("PUT /api/categories/:id", () => {
    test("should update a category successfully", async () => {
      const updateData = { name: "Updated Electronics" };
      const updatedCategory = { ...mockCategory, ...updateData };
      Category.findByIdAndUpdate.mockResolvedValue(updatedCategory);

      const res = await request(app)
        .put(`/api/categories/${mockCategory._id}`)
        .set("Authorization", `Bearer ${mockToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(updateData.name);
    });

    test("should return 404 if category to update is not found", async () => {
      Category.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put("/api/categories/nonexistentId")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ name: "Update Fail" });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Category not found");
    });
  });

  describe("DELETE /api/categories/:id", () => {
    test("should delete a category and its associated image", async () => {
      Category.findById.mockResolvedValue(mockCategory);
      fs.existsSync.mockReturnValue(true);
      Category.findByIdAndDelete.mockResolvedValue(mockCategory);

      const res = await request(app)
        .delete(`/api/categories/${mockCategory._id}`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe(
        "Category and associated image deleted successfully"
      );

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(Category.findByIdAndDelete).toHaveBeenCalledWith(mockCategory._id);
    });

    test("should still delete the category from DB if the image file does not exist", async () => {
      Category.findById.mockResolvedValue(mockCategory);
      fs.existsSync.mockReturnValue(false);
      Category.findByIdAndDelete.mockResolvedValue(mockCategory);

      const res = await request(app)
        .delete(`/api/categories/${mockCategory._id}`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(200);

      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(Category.findByIdAndDelete).toHaveBeenCalledWith(mockCategory._id);
    });
  });

test("should update a category with new image", async () => {
  const updatedCategory = {
    ...mockCategory,
    name: "Updated Mobiles",
    imageUrl: "public/uploads/updated-image.png",
  };

  Category.findByIdAndUpdate.mockResolvedValue(updatedCategory);

  const res = await request(app)
    .put(`/api/categories/${mockCategory._id}`)
    .set("Authorization", `Bearer ${mockToken}`)
    .set("x-test-upload", "true")
    .send({ name: "Updated Mobiles" });

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.name).toBe("Updated Mobiles");
});
test("should return 404 if category to delete is not found", async () => {
  Category.findById.mockResolvedValue(null);

  const res = await request(app)
    .delete("/api/categories/invalid-id")
    .set("Authorization", `Bearer ${mockToken}`);

  expect(res.statusCode).toBe(404);
  expect(res.body.message).toBe("Category not found");
});
test("should return 400 if category name is missing", async () => {
  const res = await request(app)
    .post("/api/categories")
    .set("Authorization", `Bearer ${mockToken}`)
    .set("x-test-upload", "true")
    .send({});

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toBe("Category name is required.");
});
test("should return 400 if update data is empty", async () => {
  const res = await request(app)
    .put(`/api/categories/${mockCategory._id}`)
    .set("Authorization", `Bearer ${mockToken}`)
    .send({});

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toBe("No update data provided.");
});

});
