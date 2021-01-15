import dotenv from "dotenv";
dotenv.config();
export const PORT = process.env.PORT;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const DATABASE_URL = process.env.DATABASE_URL;
export const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
export const EMAIL_PASS = process.env.EMAIL_PASS;
