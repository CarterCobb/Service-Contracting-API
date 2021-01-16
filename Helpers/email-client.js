import mail from "nodemailer";
const { createTransport } = mail;
import { EMAIL_PASS, EMAIL_USERNAME, FROM_EMAIL } from "./KEYS.js";
import fs from "fs";
import { promisify } from "util";
const readFile = promisify(fs.readFile);

/**
 * Sends an email
 * @param {String} to email to send content to
 * @param {String} subject email subject
 * @param {String} text email body/text
 *
 * @return {Object} {message: "message"} on success
 * @return {Object} {error: "description"} on fail
 */
export const sendEmail = async (to, subject, new_password) => {
  var html = await readFile("./Models/email.html", "utf8")
  html = html.replace("[new_password]", new_password);
  var transporter = createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: `${EMAIL_USERNAME}`,
      pass: `${EMAIL_PASS}`,
    },
  });
  await transporter
    .sendMail({
      from: `Lawn Care API <${FROM_EMAIL}>`,
      replyTo: `${FROM_EMAIL}`,
      to,
      subject,
      html,
    })
    .catch((err) => {
      return { error: err.message };
    });
  return { message: "Email Sent" };
};
