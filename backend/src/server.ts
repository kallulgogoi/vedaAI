import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import {
  createAssessment,
  addManualQuestion,
} from "./controllers/assessmentCtrl";
import { setupWorker } from "./queues/worker";
import { connectDB } from "./config/db";
import apiRoutes from "./routes/api";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup WebSockets
const io = new Server(server, { cors: { origin: "*" } });

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api", apiRoutes);

io.on("connection", (socket: any) => {
  console.log(`Frontend connected: ${socket.id}`);

  // Frontend tells us which assessment ID it is waiting for
  socket.on("join-room", (assessmentId: string) => {
    socket.join(assessmentId);
    console.log(`Joined room: ${assessmentId}`);
  });
});

setupWorker(io);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("FATAL ERROR: Server failed to start!", err);
  });
