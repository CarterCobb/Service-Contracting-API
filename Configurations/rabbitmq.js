import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_HOST,
  RABBITMQ_PASSWORD,
  RABBITMQ_QUEUE,
  RABBITMQ_ROUTING_KEY,
  RABBITMQ_USERNAME,
  USE_RABBITMQ,
} from "../Helpers/KEYS.js";
import amqp from "amqplib";

class RabbitMQ {
  constructor() {
    if (USE_RABBITMQ === "true") this.start();
    else console.log("Not using RabbitMQ");
  }

  /**
   * Create a connection to the RabbitMQ container.
   * Here the Exchange is bound to the Queue.
   */
  async start() {
    try {
      const conn = await this.createConnection();
      console.log("Connected to RabbitMQ");
      this.channel = await conn.createChannel();
      await this.channel.assertExchange(RABBITMQ_EXCHANGE, "direct", {
        durable: false,
      });
      let queue = await this.channel.assertQueue(RABBITMQ_QUEUE, {
        durable: true,
      });
      await this.channel.bindQueue(
        queue.queue,
        RABBITMQ_EXCHANGE,
        RABBITMQ_ROUTING_KEY
      );
    } catch (err) {
      console.log("RabbitMQ Connection Error:", err.message);
    }
  }

  /**
   * Configures the connection to RabbitMQ.
   * This will alos log the status of the connection.
   * @returns {amqp.Connection} connection.
   */
  async createConnection() {
    const config = {
      protocol: "amqp",
      hostname: RABBITMQ_HOST,
      port: 5672,
      username: RABBITMQ_USERNAME,
      password: RABBITMQ_PASSWORD,
      locale: "en_US",
      frameMax: 0,
      heartbeat: 0,
      vhost: "/",
    };
    const conn = await amqp.connect(config);
    conn.on("error", (err) => {
      console.log("RabbitMQ Connection Error:", err.message);
      process.exit(1);
    });
    conn.on("close", (err) =>
      console.log("RabbitMQ Conection Closed:", err.message)
    );
    return conn;
  }

  /**
   * Sends a message to the RabbitMQ queue {RABBITMQ_QUEUE}
   * @param {String || Object} message
   * @returns {boolean} if the message was sent or not
   */
  async sendMessage(message) {
    return this.channel.publish(
      RABBITMQ_EXCHANGE,
      RABBITMQ_ROUTING_KEY,
      typeof message === String
        ? Buffer.from(message)
        : Buffer.from(JSON.stringify(message)),
      { persistant: true }
    );
  }
}

export default RabbitMQ;
