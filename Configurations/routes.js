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

/**
 * Cache Stat Data
 */
var hitCount = 0;
var errorCount = 0;
var invalidations = 0;
var gets = 0;

/**
 * Cache listeners
 */
cache.on("error", (error) => console.log("REDIS:", error.message));
cache.on("message", (message) => {
  console.log("REDIS:", message, typeof message);
  if (
    message.includes("GET") ||
    message.includes("SET") ||
    message.includes("DEL")
  ) {
    if (message.includes("GET")) gets++;
    hitCount++;
  }
});
cache.on("connected", () => console.log("Connected to Redis"));

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
   * Retuns the proper caching middleware function for the route.
   * @param {Object} route route object
   * @return {Function} middleware
   */
  cacheRoute(route) {
    return route.type === eRequestType.GET
      ? /**
         * cache midleware.
         */
        cache.route(route.url.split("/")[2].replaceAll(/:[\w\s]*/gi, ""))
      : /**
         * Delete cache data on mutations
         */
        (req, res, next) =>
          cache.del(
            route.url.split("/")[2].replaceAll(/:[\w\s]*/gi, ""),
            (err, deleted) => {
              if (err || !deleted) {
                errorCount++;
                return sendError(
                  500,
                  req,
                  res,
                  err || "Failed to delete",
                  "CACHE_ERROR"
                );
              } else {
                invalidations++;
                return next();
              }
            }
          );
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
        /**
         * If no callback (Not authenticated) cache the route
         * else call the handler for no authed route
         */
        route.callback ? route.handler : this.cacheRoute(route),
        /**
         * If no callback call the handler and end,
         * else cache the now authenticated handler
         */
        route.callback ? this.cacheRoute(route) : route.handler,
        /**
         * Finally call the autheticated route callback
         */
        route.callback
          ? route.callback
          : () => {
              /* No Callback */
            }
      );
    });
    /**
     * Cache Stats. Seperate from main files.
     */
    this.app.get("/api/stats", (req, res) => {
      var keys = [];
      var size = 0;
      cache.get((err, entries) => {
        if (err) return sendError(500, req, res, err, "CACHE_KEY_GET_ERROR");
        keys = entries.map((entry) => entry.name);
        cache.size((err, bytes) => {
          if (err) return sendError(500, req, res, err, "CACHE_SIZE_GET_ERROR");
          size = bytes;
          return res.status(200).json({
            _embeded: {
              total_requests_serviced: `# of GET, SET, DEL: ${hitCount}`,
              raw_total_requests_serviced: hitCount,
              seviced_with_get: `# of GET: ${gets}`,
              raw_serviced_with_get: gets,
              invalidations,
              keys: keys.length,
              errors: errorCount,
              key_size: Buffer.byteLength(keys.join(""), "utf-8"),
              value_size: size,
            },
            _links: {},
          });
        });
      });
    });
  }
}

export default RouteConfig;
