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
  uploadLimiter,
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

//express config
app.use(morgan("tiny"));
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
app.use("/api/users", authLimiter, noCache, require("./routes/users.js"));
app.use(
  "/api/products",
  productsLimiter,
  cacheProducts,
  require("./routes/products.js")
);
app.use("/api/categories", cacheStaticData, require("./routes/categories.js"));
app.use("/api/brands", cacheStaticData, require("./routes/brands.js"));
app.use("/api/payments", noCache, require("./routes/payments.js"));
app.use("/api/landing", cacheStaticData, require("./routes/landing-config.js"));
app.use(
  "/api/admin/payments",
  adminLimiter,
  noCache,
  require("./routes/admin-payments.js")
);
app.use(
  "/api/admin/products",
  adminLimiter,
  uploadLimiter,
  noCache,
  validateFileSize(10 * 1024 * 1024),
  validateFileTypes(["image/jpeg", "image/png", "image/webp"]),
  require("./routes/admin-products.js")
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
