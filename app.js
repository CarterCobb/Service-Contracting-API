import express from "express";
import bodyParser from "body-parser";
import { PORT as ENV_PORT } from "./Helpers/KEYS.js";
import Routes from "./Configurations/routes.js";
import Mongo from "./Configurations/database.js"
export const PORT = ENV_PORT | 1000;
const app = express();

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb", extended: true }));

new Routes(app);
new Mongo();

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
