//error handler middleware
const errorHandler = (err, req, res, next) => {
  //check if res.haders have already been sent to the client
  if (res.headerSent) {
    //if true - pass thee error to rhe next error handling middleware
    return next(err);
  }

  //set the status code of the response
  const statusCode =
    res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode);

  // log error stack trace to the console if not iin  production --> for debugginig
  if (process.env.NODE_ENV !== "production") {
    console.log(err);
  }

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;
