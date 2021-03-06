import express from "express";
import bodyParser from "body-parser";
import { PORT as ENV_PORT, USE_RABBITMQ } from "./Helpers/KEYS.js";
import Routes from "./Configurations/routes.js";
import Mongo from "./Configurations/database.js";
import RabbitMQ from "./Configurations/rabbitmq.js";
export const PORT = ENV_PORT | 1000;
const app = express();

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb", extended: true }));

new Routes(app);
new Mongo();
export const rabbit = new RabbitMQ();

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
