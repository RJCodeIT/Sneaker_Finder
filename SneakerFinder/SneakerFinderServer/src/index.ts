import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import cartRoutes from "./routes/cartRoutes";
import productsRoutes from "./routes/productsRoutes";
import checkoutRoutes from "./routes/checkoutRoutes";
import orderRoutes from "./routes/orderRoutes";
import adminRoutes from "./routes/adminRoutes";
import webhookRouter from "./webhookEndpoint";
import { scrapeAllProducts, saveData } from "./services/scrape";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = "https://grailpoint.com";

// Configure CORS with all necessary options
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://57.128.159.250/sneakerFinder/']
    : [
        'http://localhost:5001',
        'http://127.0.0.1:5001',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept', 
    'Origin', 
    'X-Requested-With',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers',
    'stripe-signature'
  ],
  exposedHeaders: ['Authorization'],
};

// Add pre-flight handling
app.options('*', cors(corsOptions));

// Mount the webhook endpoint before any body parsers
app.use(webhookRouter);

// Apply CORS after webhook endpoint
app.use(cors(corsOptions));

// Body parsing middleware for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Test endpoint
app.get("/sneakerFinder/api/", (req: Request, res: Response) => {
  res.send("Backend is running and connected to the database!");
});

app.use("/sneakerFinder/api/users", userRoutes);
app.use("/sneakerFinder/api/chat", chatRoutes);
app.use("/sneakerFinder/api/cart", cartRoutes);
app.use("/sneakerFinder/api/products", productsRoutes);
app.use("/sneakerFinder/api/checkout", checkoutRoutes);
app.use("/sneakerFinder/api/orders", orderRoutes);
app.use("/sneakerFinder/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
