const request = require("supertest");
const express = require("express");
const userRouter = require("../routes/userRoutes");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../models/User");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

const app = express();
app.use(express.json());
app.use("/api/users", userRouter);

describe("User Authentication API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/users/register", () => {
    test("should register a new user successfully", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        phone: "1234567890",
        password: "Password123!",
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPassword");
      const mockSave = jest.fn().mockResolvedValue(true);
      User.prototype.save = mockSave;

      const res = await request(app).post("/api/users/register").send(userData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("User registered successfully");
    });

    test("should return 400 if user with the same email or phone already exists", async () => {
      const userData = {
        username: "existinguser",
        email: "existing@example.com",
        phone: "0987654321",
        password: "Password123!",
      };

      User.findOne.mockResolvedValue({ email: "existing@example.com" });

      const res = await request(app).post("/api/users/register").send(userData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(
        "User already exists with this email or phone number"
      );
    });

    test("should return a 500 error if registration fails", async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPassword");
      const mockSave = jest.fn().mockRejectedValue(new Error("Database error"));
      User.prototype.save = mockSave;

      const res = await request(app).post("/api/users/register").send({
        username: "testuser",
        email: "test@example.com",
        phone: "1234567890",
        password: "Password123!",
      });

      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBe("Registration failed");
    });

    test("should return 400 for invalid user input", async () => {
      const res = await request(app).post("/api/users/register").send({
        username: "te",
        email: "not-an-email",
        phone: "123",
        password: "weak",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/users/login", () => {
    test("should login a user successfully", async () => {
      const user = {
        _id: "someId",
        username: "testuser",
        email: "test@example.com",
        password: "hashedPassword",
      };
      const loginCredentials = {
        email: "test@example.com",
        password: "Password123!",
      };

      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("fake-jwt-token");

      const res = await request(app)
        .post("/api/users/login")
        .send(loginCredentials);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("login success");
      expect(res.body.token).toBe("fake-jwt-token");
    });

    test("should return 400 if user is not found", async () => {
      const loginCredentials = {
        email: "nonexistent@example.com",
        password: "Password123!",
      };

      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/users/login")
        .send(loginCredentials);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("user not found");
    });

    test("should return 400 for an invalid password", async () => {
      const user = {
        _id: "someId",
        username: "testuser",
        email: "test@example.com",
        password: "hashedPassword",
      };
      const loginCredentials = {
        email: "test@example.com",
        password: "wrongPassword",
      };

      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post("/api/users/login")
        .send(loginCredentials);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid password");
    });

    test("should return a 500 error if login fails", async () => {
      User.findOne.mockRejectedValue(new Error("Database error"));

      const res = await request(app).post("/api/users/login").send({
        email: "test@example.com",
        password: "Password123!",
      });

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
    });
  });
  

  test("should return 401 when no token provided", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Unauthorized: No token provided.");
  });
});





describe("POST /api/users/forgot-password", () => {
  test("should return 200 even if email does not exist (security)", async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/users/forgot-password")
      .send({ email: "nonexistent@example.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBe("Email sent");
  });
});





