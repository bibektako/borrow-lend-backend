const request = require("supertest");
const express = require("express");
const reviewRouter = require("../routes/reviewRoutes");
const Review = require("../models/Review");

jest.mock("../models/Review");

const app = express();
app.use(express.json());
app.use("/api/reviews", reviewRouter);

describe("Review Management API", () => {
  let mockReview;

  beforeEach(() => {
    mockReview = {
      _id: "reviewId123",
      rating: 5,
      comment: "Excellent item!",
      user_id: "userId123",
      item_id: "itemId123",
    };
  });



  describe("GET /api/reviews", () => {
    test("should fetch all reviews with populated user data", async () => {
      Review.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockReview]),
      });

      const res = await request(app).get("/api/reviews");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].comment).toBe(mockReview.comment);
      expect(Review.find).toHaveBeenCalledWith({});
    });

    test("should filter reviews by item_id if provided in query", async () => {
      const itemId = "filterItemId";
      Review.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([]),
      });

      await request(app).get(`/api/reviews?item_id=${itemId}`);

      expect(Review.find).toHaveBeenCalledWith({ item_id: itemId });
    });
  });

  describe("GET /api/reviews/:id", () => {
    test("should fetch a single review by its ID", async () => {
      Review.findById.mockResolvedValue(mockReview);

      const res = await request(app).get(`/api/reviews/${mockReview._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(mockReview._id);
    });

    test("should return 404 if review is not found", async () => {
      Review.findById.mockResolvedValue(null);

      const res = await request(app).get("/api/reviews/nonExistentId");

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Review not found");
    });
  });



  describe("DELETE /api/reviews/:id", () => {
    test("should delete a review successfully", async () => {
      Review.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const res = await request(app).delete(`/api/reviews/${mockReview._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Review deleted");
      expect(Review.deleteOne).toHaveBeenCalledWith({ _id: mockReview._id });
    });
  });
});
