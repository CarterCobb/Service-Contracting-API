import dotenv from "dotenv";
dotenv.config();
// RabbitMQ
export const RABBITMQ_CONSUMER_PORT = process.env.RABBITMQ_CONSUMER_PORT;
export const USE_RABBITMQ = process.env.USE_RABBITMQ;
export const RABBITMQ_QUEUE = process.env.RABBITMQ_QUEUE;
export const RABBITMQ_EXCHANGE = process.env.RABBITMQ_EXCHANGE;
export const RABBITMQ_ROUTING_KEY = process.env.RABBITMQ_ROUTING_KEY;
export const RABBITMQ_HOST = process.env.RABBITMQ_HOST;
export const RABBITMQ_USERNAME = process.env.RABBITMQ_USERNAME;
export const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD;

//Email
export const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const FROM_EMAIL = process.env.FROM_EMAIL;
