// File: server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';

const PORT = process.env.PORT || 4000;
const app = express();
await connectDB();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.get('/', (req, res) => res.send("API working"));
app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);

app.listen(PORT, () => console.log("Server Running on port " + PORT));
