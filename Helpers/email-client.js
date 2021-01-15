import mail from "nodemailer";
const { createTransport } = mail;
import { EMAIL_PASS, EMAIL_USERNAME, FROM_EMAIL } from "./KEYS.js";

/**
 * Sends an email
 * @param {String} to email to send content to
 * @param {String} subject email subject
 * @param {String} text email body/text
 *
 * @return {Object} {message: "message"} on success
 * @return {Object} {error: "description"} on fail
 */
export const sendEmail = async (to, subject, text) => {
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
      text,
    })
    .catch((err) => {
      return { error: err.message };
    });
  return { message: "Email Sent" };
};
