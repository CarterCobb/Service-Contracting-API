import { PORT } from "../app.js";
export const urlPrefix = "http://localhost";

/**
 * Formats HATEOAS compliant links for responses.
 * @param {Object} item Item to condition links from
 * @param {String} caller route that was called.
 * @param {String} type api object type
 * @param {Array} params optional single item response link objects conditioned by string params set here.
 *
 * @return {Object} object representing HATEOAS compliant links
 */
export const generateLinks = (item, caller, type, params = []) => {
  if (item instanceof Array) {
    return {
      _self: {
        href: `${urlPrefix}:${PORT}${caller}`,
        decription: "caller url",
        method: "GET",
      },
      items: item.map((o) => ({
        href: `${urlPrefix}:${PORT}/api/${type}/${o._id}`,
        decription: `individually retreive resource with id: ${o._id}`,
        method: "GET",
      })),
    };
  } else if (item instanceof Object) {
    return {
      self: {
        href: `${urlPrefix}:${PORT}${caller}`,
        description: "retrieve this resource individually",
        method: "GET",
      },
      ...(params.includes("all") && {
        [`all_${type}s`]: {
          href: `${urlPrefix}:${PORT}/api/${type}`,
          description: "retrieve all resources of this type",
          method: "GET",
        },
      }),
      ...(params.includes("put") && {
        put: {
          href: `${urlPrefix}:${PORT}/api/${type}/${item._id}`,
          description: "update all mutable paramerter(s) of this object",
          method: "PUT",
        },
      }),
      ...(params.includes("post") && {
        [`create_${type}`]: {
          href: `${urlPrefix}:${PORT}/api/${type}`,
          description: `Create a ${type}.`,
          method: "POST",
        },
      }),
      ...(params.includes("patch") && {
        patch: {
          href: `${urlPrefix}:${PORT}/api/${type}/${item._id}`,
          description:
            "update all or some mutable paramerter(s) of this object",
          method: "PATCH",
        },
      }),
      ...(params.includes("delete") && {
        delete: {
          href: `${urlPrefix}:${PORT}/api/${type}/${item._id}`,
          description: "delete this object",
          method: "DELETE",
        },
      }),
      ...(params.includes("claim") && {
        claim_service: {
          href: `${urlPrefix}:${PORT}/api/service/claim/${item._id}}`,
          description: "Claim this service",
          method: "PUT",
        },
      }),
      ...(params.includes("complete") && {
        complete_service: {
          href: `${urlPrefix}:${PORT}/api/service/complete/${item._id}}`,
          description: "Complete this service",
          method: "PUT",
        },
      }),
    };
  }
};
