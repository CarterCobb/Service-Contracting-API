import user_routes from "../Routes/user.js";
import service_routes from "../Routes/service.js";

/**
 * Adds the routes to the instance of the app.
 */
class RouteConfig {
  constructor(instance) {
    this.app = instance;
    this.configureRoutes(user_routes.concat(service_routes));
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
   *
   * @param {Array} routes
   */
  configureRoutes(routes) {
    routes.forEach((route) => {
      this.prop(this.app, route.type)(
        route.url,
        route.handler,
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
