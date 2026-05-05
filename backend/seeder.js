import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js"; // adjust path if different

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedUsers = async () => {
  try {
    await User.deleteMany();

    const users = [
      {
        name: "Admin User",
        email: "admin@company.com",
        password: bcrypt.hashSync("admin123", 10),
        role: "admin",
      },
      {
        name: "Meron Tesfaye",
        email: "meron.tesfaye@company.com",
        password: bcrypt.hashSync("password123", 10),
        role: "manager",
      },
      {
        name: "Dawit Hailu",
        email: "dawit.hailu@company.com",
        password: bcrypt.hashSync("password123", 10),
        role: "employee",
      },
    ];

    await User.insertMany(users);
    console.log("Demo users inserted ✅");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedUsers();

// commit-89: feat(seed): add department seeding

// commit-90: feat(seed): add employee seeding
