import { eRequestType } from "../Helpers/eRequestType.js";
import mongoose from "mongoose";
const { connection } = mongoose;
import { User } from "../Models/user.js";
import { Service } from "../Models/service.js";
import { authenticateUser } from "../Helpers/auth.js";
import { urlPrefix, generateLinks } from "../Helpers/functions.js";
import { PORT } from "../app.js";
import { sendDatabaseError, sendError } from "../Helpers/exception-handlers.js";
import eHATEOAS from "../Helpers/eHATEOAS.js";
const { ALL, CLAIM, COMPLETE, POST } = eHATEOAS;

/**
 * Array prototype to get the last element of an array
 * 
 * @return {Object} last element of array 'this'
 */
Array.prototype.last = function () {
  return this[this.length - 1];
};

const routes = [
  {
    url: "/api/service",
    type: eRequestType.GET,
    handler: authenticateUser,
    callback: async (req, res) => {
      if (req.user.role === "ADMIN" || req.user.role === "CONTRACTOR") {
        if (connection.readyState === 1) {
          try {
            var services = await Service.find();
            const users = await User.find();
            services = services.map((service) => ({
              ...service._doc,
              location: users.find(
                (user) => service.requestor.split("/").last() == user._id
              )
                ? users.find(
                    (user) => service.requestor.split("/").last() == user._id
                  ).address
                : {},
            }));
            const query_keys = Object.keys(req.query);
            for (var key of query_keys) {
              services = services.filter((service) =>
                service.location[key]
                  ? service.location[key] == req.query[key]
                  : false
              );
            }
            return res.status(200).json({
              _embedded: services,
              _links: generateLinks(services, "/api/service", "service"),
            });
          } catch (err) {
            return sendError(500, req, res, err, "SERVER_ERROR");
          }
        } else {
          return sendDatabaseError(req, res);
        }
      } else {
        return sendError(
          403,
          req,
          res,
          { message: "Forbidden from viewing all services." },
          "FORBIDDEN"
        );
      }
    },
  },
  {
    url: "/api/service/:id",
    type: eRequestType.GET,
    handler: authenticateUser,
    callback: async (req, res) => {
      if (connection.readyState === 1) {
        try {
          var service = await Service.findOne({ _id: req.params.id });
          const users = await User.find();
          service = {
            ...service._doc,
            location: users.find(
              (user) => service.requestor.split("/").last() == user._id
            )
              ? users.find(
                  (user) => service.requestor.split("/").last() == user._id
                ).address
              : {},
          };
          return res.status(200).json({
            _embedded: service,
            _links: generateLinks(service, req.url, "service", [
              ALL,
              CLAIM,
              COMPLETE,
            ]),
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
    url: "/api/service",
    type: eRequestType.POST,
    handler: authenticateUser,
    callback: async (req, res) => {
      if (req.user.role === "ADMIN" || req.user.role === "USER") {
        if (connection.readyState === 1) {
          try {
            req.body.requestor = `${urlPrefix}:${PORT}/api/user/${req.user._id}`;
            req.body.status = "OPEN";
            await Service.create(req.body);
            return res.sendStatus(201);
          } catch (err) {
            return sendError(500, req, res, err, "SERVER_ERROR");
          }
        }
      } else {
        return sendError(
          403,
          req,
          res,
          { message: "Forbidden from creating a services." },
          "FORBIDDEN"
        );
      }
    },
  },
  {
    url: "/api/service/:type/:id",
    type: eRequestType.PUT,
    handler: authenticateUser,
    callback: async (req, res) => {
      if (req.user.role === "ADMIN" || req.user.role === "CONTRACTOR") {
        if (connection.readyState === 1) {
          try {
            const service = await Service.findOne({ _id: req.params.id });
            if (!service) {
              return sendError(
                404,
                req,
                res,
                { message: `Service with id: ${req.params.id} does not exist` },
                "SERVICE_NOT_FOUND"
              );
            }
            if (req.params.type === "claim") {
              if (
                !service.status.includes("CLAIMED") &&
                !service.status.includes("COMPLETED")
              ) {
                const claimed = await Service.findOneAndUpdate(
                  { _id: req.params.id },
                  {
                    $set: {
                      status: `CLAIMED - ${urlPrefix}:${PORT}/api/user/${req.user._id}`,
                    },
                  },
                  { upsert: false, new: true }
                );
                return res.status(200).json({
                  _embedded: claimed,
                  _links: generateLinks(claimed, req.url, "service", [
                    ALL,
                    COMPLETE,
                    POST,
                  ]),
                });
              } else {
                return sendError(
                  403,
                  req,
                  res,
                  {
                    message:
                      "Cannot claim serivce due to it already being claimed or closed.",
                  },
                  "FORBIDDEN"
                );
              }
            } else if (req.params.type === "complete") {
              if (
                service.status.includes("CLAIMED") &&
                service.status.split(" ").last().split("/").last() ==
                  req.user._id
              ) {
                const completed = await Service.findOneAndUpdate(
                  {
                    _id: req.params.id,
                  },
                  {
                    $set: {
                      status: `COMPLETED - ${urlPrefix}:${PORT}/api/user/${req.user._id}`,
                    },
                  },
                  { upsert: false, new: true }
                );
                // TODO - links
                return res
                  .status(200)
                  .json({
                    _embedded: completed,
                    _links: generateLinks(completed, req.url, "service", [
                      ALL,
                      POST,
                    ]),
                  });
              } else {
                return sendError(
                  403,
                  req,
                  res,
                  {
                    message:
                      "Cannot complete service as its is completed, not claimed or is not cliamed by you.",
                  },
                  "FORBIDDEN"
                );
              }
            } else {
              return sendError(
                404,
                req,
                res,
                {
                  message: `service action type: ${req.params.type} does not exist`,
                },
                "TYPE_NOT_FOUND"
              );
            }
          } catch (err) {
            return sendError(500, req, res, err, "SERVER_ERROR");
          }
        }
      } else {
        return sendError(
          403,
          req,
          res,
          {
            message: "Cannot claim serivce as a USER",
          },
          "FORBIDDEN"
        );
      }
    },
  },
];

export default routes;
