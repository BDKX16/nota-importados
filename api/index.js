//requires
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const colors = require("colors");
const {
  generalLimiter,
  authLimiter,
  productsLimiter,
  userGetLimiter,
  adminLimiter,
} = require("./middlewares/rateLimiter");
const {
  securityHeaders,
  compressionMiddleware,
  cacheProducts,
  cacheStaticData,
  noCache,
  validateFileSize,
  validateFileTypes,
} = require("./middlewares/cacheAndSecurity");

require("dotenv").config();

//instances
const app = express();

// Trust proxy configuration for production environments
// This enables Express to trust the X-Forwarded-* headers
if (process.env.NODE_ENV === "production") {
  // Configuración específica para nginx como proxy reverso
  // Confía en proxies de redes privadas (típico setup con nginx)
  app.set("trust proxy", [
    "loopback",
    "linklocal",
    "uniquelocal",
    "172.18.0.0/16",
  ]);
} else {
  // In development, only trust localhost proxies
  app.set("trust proxy", "loopback");
}

//express config
app.use(morgan("tiny"));

// Middleware de debug para headers de proxy (solo en producción con debug)
if (
  process.env.NODE_ENV === "production" &&
  process.env.DEBUG_PROXY === "true"
) {
  app.use((req, res, next) => {
    console.log("Proxy Debug Headers:", {
      "x-forwarded-for": req.headers["x-forwarded-for"],
      "x-real-ip": req.headers["x-real-ip"],
      "x-forwarded-proto": req.headers["x-forwarded-proto"],
      "x-forwarded-host": req.headers["x-forwarded-host"],
      "req.ip": req.ip,
      "req.ips": req.ips,
      "remote-address": req.connection?.remoteAddress,
    });
    next();
  });
}

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors());

// Security and compression middleware
app.use(securityHeaders);
app.use(compressionMiddleware);

// Rate limiting middleware - aplicado globalmente
app.use(generalLimiter);

//express routes
app.use(
  "/api/users",
  authLimiter,
  userGetLimiter,
  noCache,
  require("./routes/users.js")
);
app.use(
  "/api/products",
  userGetLimiter,
  productsLimiter,
  cacheProducts,
  require("./routes/products.js")
);
app.use(
  "/api/categories",
  userGetLimiter,
  cacheStaticData,
  require("./routes/categories.js")
);
app.use(
  "/api/brands",
  userGetLimiter,
  cacheStaticData,
  require("./routes/brands.js")
);
app.use("/api/payments", noCache, require("./routes/payments.js"));
app.use("/api/orders", userGetLimiter, noCache, require("./routes/orders.js"));
app.use(
  "/api/shipping",
  userGetLimiter,
  noCache,
  require("./routes/shipping.js")
);
app.use(
  "/api/contact",
  userGetLimiter,
  noCache,
  require("./routes/contact.js")
);
app.use(
  "/api/landing",
  userGetLimiter,
  cacheStaticData,
  require("./routes/landing-config.js")
);
app.use(
  "/api/admin/payments",
  adminLimiter,
  noCache,
  require("./routes/admin-payments.js")
);
app.use(
  "/api/admin/products",
  adminLimiter,
  noCache,
  validateFileSize(10 * 1024 * 1024),
  validateFileTypes(["image/jpeg", "image/png", "image/webp"]),
  require("./routes/admin-products.js")
);
app.use(
  "/api/admin/brands",
  adminLimiter,
  noCache,
  require("./routes/admin-brands.js")
);
app.use(
  "/api/admin",
  adminLimiter,
  noCache,
  require("./routes/configuration.js")
);
app.use(
  "/api/admin/emails",
  adminLimiter,
  noCache,
  require("./routes/admin-emails.js")
);
app.use("/api/images", require("./routes/images.js"));

module.exports = app;

//listener
app.listen(process.env.API_PORT, () => {
  console.log("API server listening on port " + process.env.API_PORT);
});

//Mongo Connection
const mongoUserName = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT;
const mongoDatabase = process.env.MONGO_DATABASE;

var uri =
  "mongodb://" +
  mongoUserName +
  ":" +
  mongoPassword +
  "@" +
  mongoHost +
  ":" +
  mongoPort +
  "/" +
  mongoDatabase +
  "?authSource=admin";

console.log(uri);

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: "admin",
};

mongoose.connect(uri, options).then(
  () => {
    console.log("\n");
    console.log("*******************************".green);
    console.log("✔ Mongo Successfully Connected!".green);
    console.log("*******************************".green);
    console.log("\n");
  },
  (err) => {
    console.log("\n");
    console.log("*******************************".red);
    console.log("    Mongo Connection Failed    ".red);
    console.log("*******************************".red);
    console.log("\n");
    console.log(err);
  }
);
