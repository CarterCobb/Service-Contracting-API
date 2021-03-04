import user_routes from "../Routes/user.js";
import service_routes from "../Routes/service.js";
import messaging_routes from "../Routes/messaging.js";
import { USE_RABBITMQ } from "../Helpers/KEYS.js";
import { eRequestType } from "../Helpers/eRequestType.js";
import { sendError } from "../Helpers/exception-handlers.js";
import redis from "express-redis-cache";
const cache = redis({
  host: "redis",
  port: 6379,
});

cache.on("error", (error) => console.log(error));
cache.on("message", (message) => console.log("REDIS:", message));
cache.on("connected", () => console.log("REDIS Connected"));

/**
 * Adds the routes to the instance of the app.
 */
class RouteConfig {
  constructor(instance) {
    this.app = instance;
    this.configureRoutes(
      user_routes
        .concat(service_routes)
        .concat(USE_RABBITMQ === "true" ? messaging_routes : [])
    );
  }

  /**
   * Returns a bound method available on an object.
   *
   * @param {Object} obj object to bind method
   * @param {String} key name of object method
   *
   * @return {Function} funtion found from the object
   */
  prop(obj, key) {
    return obj[key].bind(obj);
  }

  /**
   * Takes an array of route objects and binds them to the instance of the app.
   * Also adds Cache data to redis. If The request is not a get the cache is deleted.
   * @param {Array} routes
   */
  configureRoutes(routes) {
    routes.forEach((route) => {
      this.prop(this.app, route.type)(
        route.url,
        route.handler,
        route.type === eRequestType.GET
          ? cache.route(route.url.split("/")[2].replaceAll(/:[\w\s]*/gi, ""))
          : (req, res, next) =>
              cache.del(
                route.url.split("/")[2].replaceAll(/:[\w\s]*/gi, ""),
                (err, _deleted) => {
                  if (err)
                    return sendError(500, req, res, err, "REDIS_CACHE_ERROR");
                  else return next();
                }
              ),
        route.callback
          ? route.callback
          : () => {
              /*no callback*/
            }
      );
    });
  }
}

export default RouteConfig;
