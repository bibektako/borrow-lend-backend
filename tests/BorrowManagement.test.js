const request = require("supertest");
const express = require("express");
const borrowRoutes = require("../routes/borrowRoutes");
const BorrowRequest = require("../models/BorrowRequest");
const Item = require("../models/Items");
const User = require("../models/User");
const { createNotification } = require("../service/notification_service");
const mongoose = require("mongoose");

jest.mock("../models/BorrowRequest");
jest.mock("../models/Items");
jest.mock("../models/User");
jest.mock("../service/notification_service");

// Valid ObjectIds
const mockOwnerId = new mongoose.Types.ObjectId();
const mockBorrowerId = new mongoose.Types.ObjectId();
const mockItemId = new mongoose.Types.ObjectId();
const mockRequestId = new mongoose.Types.ObjectId();

const app = express();
app.use(express.json());

// 🧠 Mock middleware BEFORE route import
jest.mock("../middlewares/authorizedUser", () => ({
  authenticateUser: (req, res, next) => {
    req.user = { id: mockOwnerId.toString(), role: "user" };
    next();
  }
}));

// Re-import routes after middleware mock
app.use("/api/borrow", require("../routes/borrowRoutes"));

describe("POST /api/borrow/request/:itemId", () => {
  afterEach(() => jest.clearAllMocks());

  test("should create a borrow request successfully", async () => {
    Item.findById.mockResolvedValue({
      _id: mockItemId,
      owner: mockBorrowerId,
      status: "available",
      save: jest.fn()
    });

    BorrowRequest.prototype.save = jest.fn().mockResolvedValue({ _id: "br1" });

    const res = await request(app)
      .post(`/api/borrow/request/${mockItemId}`)
      .send();

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(createNotification).toHaveBeenCalled();
  });

  test("should return 400 if borrowing own item", async () => {
    Item.findById.mockResolvedValue({
      _id: mockItemId,
      owner: mockOwnerId,
      status: "available"
    });

    const res = await request(app)
      .post(`/api/borrow/request/${mockItemId}`)
      .send();

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("You cannot borrow your own item.");
  });

  test("should return 404 if item not found", async () => {
    Item.findById.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/borrow/request/${mockItemId}`)
      .send();

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Item not found.");
  });
});



describe("PATCH /api/borrow/request/:requestId", () => {
  afterEach(() => jest.clearAllMocks());

  test("should approve request if user is owner", async () => {
    BorrowRequest.findById.mockResolvedValue({
      _id: mockRequestId,
      item: mockItemId,
      owner: mockOwnerId,
      borrower: mockBorrowerId,
      status: "pending",
      save: jest.fn(),
    });

    Item.findById.mockResolvedValue({
      _id: mockItemId,
      status: "requested",
      save: jest.fn(),
    });

    const res = await request(app)
      .patch(`/api/borrow/request/${mockRequestId}`)
      .send({ status: "approved" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/updated to approved/i);
    expect(createNotification).toHaveBeenCalled();
  });

  test("should return 404 if request not found", async () => {
    BorrowRequest.findById.mockResolvedValue(null);

    const res = await request(app)
      .patch(`/api/borrow/request/${mockRequestId}`)
      .send({ status: "approved" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Request not found.");
  });

  test("should return 403 if unauthorized action", async () => {
    BorrowRequest.findById.mockResolvedValue({
      _id: mockRequestId,
      item: mockItemId,
      owner: mockBorrowerId, // 👈 mockOwner is different, current user is not owner
      borrower: mockOwnerId,
      status: "pending",
      save: jest.fn(),
    });

    const res = await request(app)
      .patch(`/api/borrow/request/${mockRequestId}`)
      .send({ status: "approved" });

    expect(res.statusCode).toBe(403);
  });
});
