import express from "express";
import RabbitMQ from "./rabbitmq.js";
import { RABBITMQ_CONSUMER_PORT as ENV_PORT, USE_RABBITMQ } from "./KEYS.js";
const PORT = ENV_PORT || 1002;
const app = express();
export const rabbit = new RabbitMQ();

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
