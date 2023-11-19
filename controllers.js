const { users } = require("./model");
const utils = require("./utils");
const nodemailer = require("nodemailer");
const sentry = require("./index");
const { encryptData, verifyData } = require("./utils/hash.utils");
const jwt = require("jsonwebtoken");
const response = require("./utils/response.utils");

module.exports = {
  register: async (req, res) => {
    try {
      const data = await users.create({
        data: {
          email: req.body.email,
          password: await utils.cryptPassword(req.body.password),
        },
      });

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: "system@gmail.com",
        to: req.body.email,
        subject: "Success REGISTER",
        html: `<p>Congratulations, you have Registered in this Application</p>`, // Local host
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.log(err);
          return res.render("error");
        }

        // return res.status(201).json({
        //   data,
        // });
        return res.render("successRegis", { data });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
      });
    }
  },

  loginUser: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!(email && password)) {
        throw createError(400, "Bad request");
      }

      const user = await users.findUnique({ where: { email } });

      if (!user)
        throw createError(404, "Account is not registered, register first");

      const isPassMatch = await verifyData(password, user.password);

      if (!isPassMatch)
        throw createError(403, "Email or password is incorrect!");

      const payload = { id: user.id, email: user.email };
      const token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });

      return res.status(200).json(response.success("Login success", token));
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  logout: (req, res, next) => {
    try {
      // Clear the 'token' cookie by setting it to an empty value and expiring it immediately
      res.clearCookie("token");

      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error(error);
      sentry.captureException(error);
      next(createError(500, "Something went wrong"));
    }
  },

  resetPassword: async (req, res) => {
    try {
      const findUser = await users.findFirst({
        where: {
          email: req.body.email,
        },
      });

      if (!findUser) {
        return res.render("error");
      }

      const encrypt = await utils.cryptPassword(req.body.email);

      await users.update({
        data: {
          resetPasswordToken: encrypt,
        },
        where: {
          id: findUser.id,
        },
      });

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: "system@gmail.com",
        to: req.body.email,
        subject: "Reset Password",
        html: `<p>Reset Your Password <a href="http://localhost:3000/set-password/${encrypt}">Click Here</a></p>`, // Local host
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.log(err);
          return res.render("error");
        }

        return res.render("successReset");
      });
    } catch (error) {
      console.log(error);
      sentry.captureException(error);
      return res.status(500).json({
        error,
      });
    }
  },
  setPassword: async (req, res) => {
    try {
      const findUser = await users.findFirst({
        where: {
          resetPasswordToken: req.body.key,
        },
      });

      if (!findUser) {
        return res.render("error");
      }

      await users.update({
        data: {
          password: await utils.cryptPassword(req.body.password),
          resetPasswordToken: null,
        },
        where: {
          id: findUser.id,
        },
      });

      return res.render("successSet");
    } catch (error) {
      console.log(error);
      sentry.captureException(error);
      return res.status(500).json({
        error,
      });
    }
  },
};
