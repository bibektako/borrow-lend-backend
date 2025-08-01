const request = require("supertest");
const express = require("express");
const itemRouter = require("../routes/itemsRoutes");
const Item = require("../models/Items");
const User = require("../models/User");
const Category = require("../models/Category");
const jwt = require("jsonwebtoken");

jest.mock("../models/Items");
jest.mock("../models/User");
jest.mock("../models/Category");
jest.mock("jsonwebtoken");

jest.mock("../middlewares/uploadMiddleware", () => ({
  array: jest.fn(() => (req, res, next) => {
    req.files = [{ path: "public/uploads/mock-image.jpg" }];
    next();
  }),
}));

const app = express();
app.use(express.json());
app.use("/api/items", itemRouter);

process.env.SECRET = "test-secret";

describe("Item Management API", () => {
  let mockUser, mockAdmin, mockItem, mockToken;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      _id: "userId123",
      id: "userId123",
      role: "normal",
      location: "Testville",
    };
    mockAdmin = { _id: "adminId456", id: "adminId456", role: "admin" };
    mockToken = "valid-token";

    mockItem = {
      _id: "itemId789",
      name: "Test Item",
      description: "A test item",
      owner: mockUser._id,
      category: "catId123",
      isVerified: false,
      deleteOne: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
    };

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    jwt.verify.mockReturnValue({ _id: mockUser._id });
  });

  describe("Authentication Middleware", () => {
    test("should fail with 401 if no token is provided", async () => {
      const res = await request(app).post("/api/items").send({});
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Unauthorized: No token provided.");
    });

    test("should fail with 401 for a JsonWebTokenError", async () => {
      const error = new Error("Invalid token");
      error.name = "JsonWebTokenError";
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      const res = await request(app)
        .post("/api/items")
        .set("Authorization", "Bearer invalid-token");

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Unauthorized: Invalid token.");
    });
  });

  describe("DELETE /api/items/:id", () => {
    test("should allow item owner to delete their item", async () => {
      Item.findById.mockResolvedValue(mockItem);

      const res = await request(app)
        .delete(`/api/items/${mockItem._id}`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Item successfully deleted.");
      expect(mockItem.deleteOne).toHaveBeenCalled();
    });

    test("should prevent non-owner from deleting an item", async () => {
      const anotherUser = { _id: "anotherUserId", role: "normal" };
      jwt.verify.mockReturnValue({ _id: anotherUser._id });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(anotherUser),
      });

      Item.findById.mockResolvedValue(mockItem);

      const res = await request(app)
        .delete(`/api/items/${mockItem._id}`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("User not authorized to delete this item.");
    });
  });

  describe("PATCH /api/items/:id/verify", () => {
    test("should allow an admin to verify an item", async () => {
      jwt.verify.mockReturnValue({ _id: mockAdmin._id });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmin),
      });

      Item.findById.mockResolvedValue(mockItem);

      const res = await request(app)
        .patch(`/api/items/${mockItem._id}/verify`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Item verified successfully.");
      expect(mockItem.save).toHaveBeenCalled();
    });

    test("should prevent a non-admin from verifying an item", async () => {
      Item.findById.mockResolvedValue(mockItem);

      const res = await request(app)
        .patch(`/api/items/${mockItem._id}/verify`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Forbidden: Admin privilege required.");
    });
  });

  test("should create an item successfully", async () => {
    Category.findById.mockResolvedValue({ _id: mockItem.category, name: "Electronics" });
    Item.prototype.save = jest.fn().mockResolvedValue(mockItem);

    const res = await request(app)
      .post("/api/items")
      .set("Authorization", `Bearer ${mockToken}`)
      .send({
        name: mockItem.name,
        description: mockItem.description,
        category: mockItem.category,
        borrowingPrice: 100
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Item created successfully.");
  });

  test("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/items")
      .set("Authorization", `Bearer ${mockToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Please provide all required fields.");
  });

 

  test("should get all items", async () => {
    Item.aggregate.mockResolvedValue([mockItem]);

    const res = await request(app)
      .get("/api/items")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });
});
