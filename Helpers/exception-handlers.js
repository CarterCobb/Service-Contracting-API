export const sendError = (status, req, res, err, code) => {
  return res.status(status).json({
    code,
    message: err.message,
    time_stamp: new Date(Date.now()).toISOString(),
    status,
    caller: req.url,
  });
};

export const sendDatabaseError = (req, res) => {
  return sendError(
    500,
    req,
    res,
    { message: "No database connetion" },
    "DATABASE_ERROR"
  );
};
