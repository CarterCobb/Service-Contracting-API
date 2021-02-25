import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_HOST,
  RABBITMQ_PASSWORD,
  RABBITMQ_QUEUE,
  RABBITMQ_ROUTING_KEY,
  RABBITMQ_USERNAME,
  USE_RABBITMQ,
} from "./KEYS.js";
import amqp from "amqplib";
import fs from "fs";
import { promisify } from "util";
const readFile = promisify(fs.readFile);
import { sendEmail } from "./email-client.js";

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
      this.startLookingForMessages();
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
   * Listener for new messages in the queue.
   * Handles the message and removes it from the queue.
   */
  startLookingForMessages() {
    this.channel.consume(RABBITMQ_QUEUE, (message) => {
      this.onNewMessage(message.content.toString());
      this.channel.ack(message);
    });
  }

  /**
   * Handles the reciving end of the messages.
   * Logs out the message to the console if of type string.
   * Sends an email using nodemailer with detials from stringified json if type object.
   * @param {String} message
   */
  async onNewMessage(message) {
    try {
      const email = JSON.parse(message);
      switch (email.type) {
        case "PASSWORD_CHANGED": {
          var html = await readFile("./emails/pass_changed.html", "utf8");
          html = html.replace("[name]", email.name);
          await sendEmail(email.email, email.subject, html);
          break;
        }
        case "PASSWORD_RESET": {
          var html = await readFile("./emails/pass_reset.html", "utf8");
          html = html.replace("[new_password]", email.new_password);
          await sendEmail(email.email, email.subject, html);
          break;
        }
        case "SERVICE_CREATED": {
          var html = await readFile("./emails/service_created.html", "utf8");
          html = html
            .replace("[name]", email.name)
            .replace("[service]", email.service);
          await sendEmail(email.email, email.subject, html);
          break;
        }
        case "SERVICE_CLAIMED": {
          var html = await readFile(
            "./emails/service_claimed_user.html",
            "utf8"
          );
          html = html
            .replace("[user]", email.user)
            .replace("[contractor]", email.contractor)
            .replace("[service]", email.service);
          await sendEmail(email.email_user, email.subject, html);
          html = await readFile(
            "./emails/service_claimed_contractor.html",
            "utf8"
          );
          html = html
            .replace("[contractor]", email.contractor)
            .replace("[service]", email.service);
          await sendEmail(email.email_contractor, email.subject, html);
          break;
        }
        case "SERVICE_COMPLETED": {
          var html = await readFile(
            "./emails/service_completed_user.html",
            "utf8"
          );
          html = html
            .replace("[user]", email.user)
            .replace("[contractor]", email.contractor)
            .replace("[service]", email.service);
          await sendEmail(email.email_user, email.subject, html);
          html = await readFile(
            "./emails/service_completed_contractor.html",
            "utf8"
          );
          html = html
            .replace("[contractor]", email.contractor)
            .replace("[service]", email.service);
          await sendEmail(email.email_contractor, email.subject, html);
          break;
        }
        default:
          throw new Error(
            `Email type '${email.type}' is not supported. (may be fallack to string as message)`
          );
      }
    } catch (err) {
      console.log(err);
      console.log("Recived message: ", message);
    }
  }
}

export default RabbitMQ;
