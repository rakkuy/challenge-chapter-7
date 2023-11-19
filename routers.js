const { verifyToken } = require("./middlewares/verifyToken");

const express = require("express"),
  router = express.Router(),
  controller = require("./controllers"),
  { users } = require("./model");

router.get("/", (req, res) => {
  return res.render("index");
});

router.get("/register", (req, res) => {
  return res.render("register");
});

router.get("/login", (req, res) => {
  return res.render("login");
});

router.get("/reset-password", verifyToken, (req, res) => {
  return res.render("reset-password");
});

router.get("/set-password/:key", async (req, res) => {
  try {
    console.log(req.params.key);
    const findData = await users.findFirst({
      where: {
        resetPasswordToken: req.params.key,
      },
    });
    if (!findData) {
      return res.render("error");
    }

    return res.render("set-password", { user: findData });
  } catch (error) {
    console.log(error);
    return res.render("error");
  }
});

router.post("/api/v1/register", controller.register);
router.post("/api/v1/login", controller.loginUser);
router.post("/api/v1/reset-password", controller.resetPassword);
router.post("/api/v1/set-password", controller.setPassword);
router.get("/logout", verifyToken, controller.logout);

module.exports = router;
