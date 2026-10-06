import IORedis from "ioredis";

// BullMQ workers require maxRetriesPerRequest: null
export const connection = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });
