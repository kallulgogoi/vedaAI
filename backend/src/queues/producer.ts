import { Queue } from "bullmq";
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Connect to Redis
const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  tls: redisUrl.startsWith("rediss://")
    ? { rejectUnauthorized: false }
    : undefined,
});

export const assessmentQueue = new Queue("assessment-generation", {
  connection: redisConnection,
});

export const addGenerationJob = async (assessmentId: string, payload: any) => {
  await assessmentQueue.add("generate-paper", { assessmentId, payload });
};
