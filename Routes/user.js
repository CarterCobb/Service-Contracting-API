import { eRequestType } from "../Helpers/eRequestType.js";
import mongoose from "mongoose";
const { connection } = mongoose;
import { User } from "../Models/user.js";
import bcrypt from "bcrypt";
import { authenticateUser } from "../Helpers/auth.js";
import { sendError, sendDatabaseError } from "../Helpers/exception-handlers.js";
import eHATEOAS from "../Helpers/eHATEOAS.js";
import { generateLinks } from "../Helpers/functions.js";
import { sendEmail } from "../Helpers/email-client.js";
const { ALL, DELETE, PATCH, POST, PUT } = eHATEOAS;

const routes = [
  {
    url: "/api/user",
    type: eRequestType.GET,
    handler: authenticateUser,
    callback: async (req, res) => {
      if (req.user.role !== "ADMIN") {
        return res.sendStatus(403);
      }
      if (connection.readyState === 1) {
        try {
          const users = await User.find();
          users.forEach((user) => (user.password = null));
          return res.status(200).json({
            _embedded: users,
            _links: generateLinks(users, req.url, "user"),
          });
        } catch (err) {
          return sendError(500, req, res, err, "SERVER_ERROR");
        }
      } else {
        return sendDatabaseError(req, res);
      }
    },
  },
  {
    url: "/api/user/:id",
    type: eRequestType.GET,
    handler: authenticateUser,
    callback: async (req, res) => {
      if (connection.readyState === 1) {
        try {
          const {
            _doc: { password, ...user },
          } = await User.findOne({
            _id: req.params.id,
          });
          return res.status(200).json({
            _embedded: user,
            _links: generateLinks(user, req.url, "user", [
              ALL,
              DELETE,
              PATCH,
              POST,
              PUT,
            ]),
          });
        } catch (err) {
          return sendError(500, req, res, err);
        }
      } else {
        return sendDatabaseError(req, res);
      }
    },
  },
  {
    url: "/api/user",
    type: eRequestType.POST,
    handler: async (req, res) => {
      if (connection.readyState === 1) {
        try {
          req.body.password = bcrypt.hashSync(
            req.body.password,
            bcrypt.genSaltSync(10)
          );
          const user = await User.create(req.body);
          delete user.password;
          return res.status(201).json({
            _embedded: user,
            _links: generateLinks(user, req.url, "user", [
              ALL,
              DELETE,
              PATCH,
              POST,
              PUT,
            ]),
          });
        } catch (err) {
          return sendError(400, req, res, err, "BAD_REQUEST");
        }
      } else {
        return sendDatabaseError(req, res);
      }
    },
  },
  {
    url: "/api/user/:id",
    type: eRequestType.PUT,
    handler: authenticateUser,
    callback: async (req, res) => {
      if (req.user.role !== "ADMIN" && req.user._id != req.params.id) {
        return sendError(
          403,
          req,
          res,
          { message: "Cannot update other users aside from yourself." },
          "FORBIDDEN"
        );
      }
      const keys = Object.keys(req.body);
      if (
        !keys.includes("password") ||
        !keys.includes("name") ||
        !keys.includes("address")
      ) {
        return res.status(400).json({ error: "Please provide all fields" });
      }
      delete req.body.role;
      delete req.body.email;
      if (connection.readyState === 1) {
        try {
          const user = await User.findOneAndUpdate(
            { _id: req.params.id },
            {
              $set: {
                ...req.body,
                password: bcrypt.hashSync(
                  req.body.password,
                  bcrypt.genSaltSync(10)
                ),
              },
            },
            { upsert: false, new: true }
          );
          return res.status(200).json({
            _embedded: user,
            _links: generateLinks(user, req.url, "user", [
              ALL,
              DELETE,
              PATCH,
              POST,
            ]),
          });
        } catch (err) {
          if (err.code && err.code === 11000) {
            return sendError(400, req, res, err, "BAD_REQUEST");
          }
          return sendError(500, req, res, err);
        }
      } else {
        return sendDatabaseError(req, res);
      }
    },
  },
  {
    url: "/api/user/:id",
    type: eRequestType.PATCH,
    handler: authenticateUser,
    callback: async (req, res) => {
      if (req.user.role !== "ADMIN" && req.user._id != req.params.id) {
        return sendError(
          403,
          req,
          res,
          { message: "Cannot update other users aside from yourself." },
          "FORBIDDEN"
        );
      }
      delete req.body.role;
      delete req.body.email;
      if (connection.readyState === 1) {
        try {
          const user = await User.findOneAndUpdate(
            { _id: req.params.id },
            {
              $set: {
                ...req.body,
                ...(req.body.password && {
                  password: bcrypt.hashSync(
                    req.body.password,
                    bcrypt.genSaltSync(10)
                  ),
                }),
              },
            },
            { upsert: false, new: true }
          );
          return res.status(200).json({
            _embedded: user,
            _links: generateLinks(user, req.url, "user", [
              ALL,
              DELETE,
              PUT,
              POST,
            ]),
          });
        } catch (err) {
          if (err.code && err.code === 11000) {
            return sendError(400, req, res, err, "BAD_REQUEST");
          }
          return sendError(500, req, res, err);
        }
      } else {
        return sendDatabaseError(req, res);
      }
    },
  },
  {
    url: "/api/user/:id/request-new-pass",
    type: eRequestType.POST,
    handler: authenticateUser,
    callback: async (req, res) => {
      if (req.user.role !== "ADMIN" && req.user._id != req.params.id) {
        return sendError(
          403,
          req,
          res,
          { message: "Cannot request passwod reset for other users." },
          "FORBIDDEN"
        );
      }
      if (connection.readyState === 1) {
        try {
          const new_pass = Date.now().toString(16);
          const send = await sendEmail(
            req.user.email,
            "🔒 Password Reset - Lawn Care API",
            new_pass
          );
          if (send.error) {
            return sendError(500, req, res, send.error);
          }
          await User.updateOne(
            { _id: req.params.id },
            {
              $set: {
                password: bcrypt.hashSync(new_pass, bcrypt.genSaltSync(10)),
              },
            },
            { upsert: false }
          );
          return res.status(200).json({
            _embedded: {
              message: "Check your email for your new temporary password.",
            },
            _links: {},
          });
        } catch (err) {
          return sendError(500, req, res, err);
        }
      } else {
        return sendDatabaseError(req, res);
      }
    },
  },
  {
    url: "/api/user/:id",
    type: eRequestType.DELETE,
    handler: authenticateUser,
    callback: async (req, res) => {
      if (connection.readyState) {
        try {
          await User.deleteOne({ _id: req.params.id });
          return res.sendStatus(200);
        } catch (err) {
          return sendError(500, req, res, err);
        }
      } else {
        return sendDatabaseError(req, res);
      }
    },
  },
];

export default routes;
