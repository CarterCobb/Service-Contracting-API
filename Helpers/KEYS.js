import dotenv from "dotenv";
dotenv.config();
export const PORT = process.env.PORT;
export const DATABASE_URL = process.env.DATABASE_URL;
export const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const FROM_EMAIL = process.env.FROM_EMAIL;
