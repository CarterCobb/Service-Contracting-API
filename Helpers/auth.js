import mongoose from "mongoose";
const { connection } = mongoose;
import { User } from "../Models/user.js";
import bcrypt from "bcryptjs";
import { sendDatabaseError, sendError } from "../Helpers/exception-handlers.js";

/**
 * Authenticates a user and appends the user object to the request
 * @param {Object} req web request
 * @param {Object} res web response
 * @param {Object} next continue to callback
 */
export const authenticateUser = async (req, res, next) => {
  const {
    headers: { authorization: auth },
  } = req;
  if (!auth) {
    return sendError(
      401,
      req,
      res,
      { message: "Unauthorized as a user" },
      "UNAUTHORIZED"
    );
  }
  const creds = {
    email: Buffer.from(auth.split(" ").pop(), "base64")
      .toString()
      .split(":")[0],
    password: Buffer.from(auth.split(" ").pop(), "base64")
      .toString()
      .split(":")
      .pop(),
  };
  if (connection.readyState === 1) {
    var user = null;
    try {
      user = await User.findOne({ email: creds.email });
      if (user) {
        req.user = user;
        if (bcrypt.compareSync(creds.password, user.password)) {
          return next();
        }
      }
    } catch (err) {
      return sendError(500, req, res, err);
    }
  } else {
    return sendDatabaseError(req, res);
  }
  return sendError(
    401,
    req,
    res,
    { message: "Unauthorized as a user" },
    "UNAUTHORIZED"
  );
};
