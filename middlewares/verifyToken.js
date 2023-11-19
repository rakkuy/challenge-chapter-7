const jwt = require("jsonwebtoken");
const createError = require("http-errors");

module.exports = {
  verifyToken: async (req, res, next) => {
    try {
      const token = req.cookies.token; // Extract token from the 'token' cookie
      console.log(token);
      if (!token) {
        return next(createError(401, "Unauthorized"));
      }

      const verifiedPayload = jwt.verify(token, process.env.SECRET_KEY);
      res.user = verifiedPayload;
      next();
    } catch (error) {
      console.error(error);
      next(createError(401, "Unauthorized"));
    }
  },
};
