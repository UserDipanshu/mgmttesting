import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import db from "./startup/db.js";
import testRoutes from "./routes/test.js";
import b2bRoutes from "./routes/b2b.js";
import b2cRoutes from "./routes/b2c.js";
import authRoutes from "./routes/auth.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

db.connect();


// List of allowed origins
const allowedOrigins = [
  "https://management.mrmprocom.com",
  "122.160.87.56",
  "http://localhost:5173",
];

// CORS options to allow multiple origins
const corsOptions = {
  origin: function (origin, callback) {
    // If no origin is provided (e.g., for non-browser clients), allow it
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: "Content-Type,Authorization",
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/test", testRoutes);
app.use("/auth", authRoutes);
app.use("/b2b", b2bRoutes);
app.use("/b2c", b2cRoutes);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
