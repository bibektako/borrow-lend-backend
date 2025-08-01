const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const notificationRouter = require("../routes/notificationRoutes"); // Adjust path if necessary
const Notification = require("../models/Notification");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// --- MOCKS ---
jest.mock("../models/Notification");
jest.mock("../models/User");
jest.mock("jsonwebtoken");

const app = express();
app.use(express.json());

// A simplified mock of your authenticateUser middleware for testing purposes.
// This allows us to control which user is "logged in" for each test.
app.use((req, res, next) => {
    if (req.headers.authorization) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.SECRET);
            req.user = { id: decoded._id, ...decoded };
        } catch (e) {
            // Fails silently for tests where we want to simulate an invalid token.
        }
    }
    next();
});

app.use("/api/notifications", notificationRouter);

process.env.SECRET = "test-secret-key";

describe("Notification API", () => {
    let mockUser, mockToken, mockNotification;

    beforeEach(() => {
        // Reset all mocks before each test to ensure they don't interfere with each other.
        jest.clearAllMocks();

        // Use valid 24-character hex strings for all mock IDs.
        mockUser = { _id: "65a5a1b2c3d4e5f6g7h8i9j1", username: "TestUser" };
        mockToken = "valid-user-token";

        mockNotification = {
            _id: "65a5a1b2c3d4e5f6g7h8i9j2",
            recipient: mockUser._id,
            sender: { _id: "65a5a1b2c3d4e5f6g7h8i9j0", username: "OtherUser" },
            type: 'new_request',
            read: false,
            createdAt: new Date().toISOString(),
        };

        // This is the crucial part for making authentication work in tests.
        jwt.verify.mockReturnValue({ _id: mockUser._id });
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });
    });

    describe("GET /api/notifications", () => {
        test("1. should fetch notifications for the authenticated user successfully", async () => {
            // Mock the chained Mongoose query: .find().populate().sort()
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([mockNotification])
            };
            Notification.find.mockReturnValue(mockQuery);

            const res = await request(app)
                .get("/api/notifications")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBe(1);
            expect(res.body[0]._id).toBe(mockNotification._id);
        });

        test("2. should return an empty array if the user has no notifications", async () => {
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([]) // Resolve with an empty array
            };
            Notification.find.mockReturnValue(mockQuery);

            const res = await request(app)
                .get("/api/notifications")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([]);
        });

      
        
        test("4. should sort notifications by creation date descending", async () => {
            const mockQuery = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue([]) };
            Notification.find.mockReturnValue(mockQuery);

            await request(app)
                .get("/api/notifications")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
        });

        test("5. should return 401 if no authentication token is provided", async () => {
            const res = await request(app).get("/api/notifications");
            expect(res.statusCode).toBe(401);
        });

        test("6. should return 500 if the database query fails", async () => {
            const errorMessage = "Database connection lost";
            Notification.find.mockImplementation(() => {
                throw new Error(errorMessage);
            });

            const res = await request(app)
                .get("/api/notifications")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Error fetching notifications');
        });
    });

    describe("PATCH /api/notifications/read", () => {
        test("7. should mark all unread notifications as read successfully", async () => {
            Notification.updateMany.mockResolvedValue({ nModified: 3 }); // Simulate 3 notifications updated

            const res = await request(app)
                .patch("/api/notifications/read")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Notifications marked as read');
        });

      

        test("9. should return 401 if no authentication token is provided", async () => {
            const res = await request(app).patch("/api/notifications/read");
            expect(res.statusCode).toBe(401);
        });

        test("10. should return 500 if the database update fails", async () => {
            const errorMessage = "Database write error";
            Notification.updateMany.mockRejectedValue(new Error(errorMessage));

            const res = await request(app)
                .patch("/api/notifications/read")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Error updating notifications');
        });
    });

    
});