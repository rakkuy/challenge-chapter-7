const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
const router = require("./routers");
const logger = require("morgan");
const bodyParser = require("body-parser");
const sentry = require("@sentry/node");
const cookieParser = require("cookie-parser");

const { ProfilingIntegration } = require("@sentry/profiling-node");

require("dotenv").config();

sentry.init({
  dsn: "https://7ebaa884c63bececd36a3af6f50c3ed8@o4506245825953792.ingest.sentry.io/4506245843910656",
  integrations: [
    // enable HTTP calls tracing
    new sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

app.use(cookieParser());
app.set("views", "./views");
app.set("view engine", "ejs");
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);
app.use(logger("dev"));

module.exports = sentry;

app.listen(PORT, () => console.log(`App is running at PORT ${PORT}`));
