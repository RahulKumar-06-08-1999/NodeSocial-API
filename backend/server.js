import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import cors from 'cors'; 
import mongoSanitize from "express-mongo-sanitize";
import helmet from 'helmet';
import xss from "xss-clean";
import rateLimit from 'express-rate-limit';
import hpp from "hpp";
dotenv.config();
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import profileRoutes from "./routes/profileRoutes.js";
import postRoutes from "./routes/postRoutes.js"

const port = process.env.PORT || 5000;

connectDB();

const app = express();

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// // Enable CORS for all routes
app.use(cors());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
// app.use(helmet());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Get the current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/api/users', userRoutes);
app.use("/api/profiles", profileRoutes);
app.use('/api/posts', postRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
  res.send('API is running....');
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));
