import request from "supertest";

import mongoose from "mongoose";

import dotenv from "dotenv";
import { Book } from "../models/book.models.js";
import { User } from "../models/user.models.js";
import app from "../app.js";
dotenv.config();

let token = "";
let createdBookId = "";

function randomString(length: number) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const user = {
  username: `user_${randomString(6)}`,
  email: `${randomString(8)}@example.com`,
  password: "Test@1234",
};
const newBook = {
  title: "Deep Work",
  author: "Cal Newport",
  genre: "self-help",
  bookCoverImage: "https://example.com/images/focused-work.jpg",
  description:
    "This book teaches you how to focus deeply in a distracted world.",
  price: 299,
  quantity: 10,
  publishedYear: 2018,
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  await User.deleteMany({});
  await Book.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth → Register & Login", () => {
  it("should register a user", async () => {
    const res = await request(app).post("/api/v1/users/register").send(user);
    expect(res.statusCode).toBe(201);
  });

  it("should login and return JWT", async () => {
    const res = await request(app).post("/api/v1/users/login").send({
      email: user.email,
      password: user.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    token = res.body.data.accessToken;
  });
});

describe("Book Routes", () => {
  it("should create a new book", async () => {
    const res = await request(app)
      .post("/api/v1/books/new-book")
      .set("Authorization", `Bearer ${token}`)
      .send(newBook);

    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe(newBook.title);
    createdBookId = res.body.data._id;
  });

  it("should update the created book", async () => {
    const res = await request(app)
      .patch(`/api/v1/books/${createdBookId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Deep Work Revised" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe("Deep Work Revised");
  });

  it("should get the book by ID", async () => {
    const res = await request(app).get(`/api/v1/books/${createdBookId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(createdBookId);
  });

  it("should search books by title", async () => {
    const res = await request(app).get(`/api/v1/books/search?query=deep`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("should delete the book", async () => {
    const res = await request(app)
      .delete(`/api/v1/books/${createdBookId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it("should return 404 when getting deleted book", async () => {
    const res = await request(app).get(`/api/v1/books/${createdBookId}`);
    expect(res.statusCode).toBe(404);
  });
});
