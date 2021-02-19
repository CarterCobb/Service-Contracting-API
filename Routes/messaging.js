import { eRequestType } from "../Helpers/eRequestType.js";
import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_HOST,
  RABBITMQ_PASSWORD,
  RABBITMQ_QUEUE,
  RABBITMQ_ROUTING_KEY,
  RABBITMQ_USERNAME,
} from "../Helpers/KEYS.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const amqp = require("amqplib/callback_api");

const messaging_routes = [
  {
    url: "/api/producer",
    type: eRequestType.GET,
    handler: async (req, res) => {
      try {
        const { message } = req.query;
        amqp.connect(
          `amqp://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}`,
          (err0, connection) => {
            if (err0) return res.status(500).json({ error: err0 });
            connection.createChannel((err1, channel) => {
              if (err1) return res.status(500).json({ error: err1 });
              channel.assertExchange(RABBITMQ_EXCHANGE, "direct", {
                durable: false,
              });
              channel.assertQueue(
                RABBITMQ_QUEUE,
                { durable: true },
                (err2, q) => {
                  if (err2) return res.status(500).json({ error: err2 });
                  channel.bindQueue(
                    q.queue,
                    RABBITMQ_EXCHANGE,
                    RABBITMQ_ROUTING_KEY
                  );
                  const sent = channel.publish(
                    RABBITMQ_EXCHANGE,
                    RABBITMQ_ROUTING_KEY,
                    Buffer.from(message),
                    { persistent: true }
                  );
                  if (!sent) return res.status(500).json({ error: err1 });
                  return res
                    .status(200)
                    .json({ message: `Sent Message: ${message}` });
                }
              );
            });
          }
        );
      } catch (error) {
        return res.status(500).json({ error });
      }
    },
  },
];

export default messaging_routes;
