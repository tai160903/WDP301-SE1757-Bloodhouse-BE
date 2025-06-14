"use strict";

require("dotenv").config();
const express = require("express");
const http = require("http");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const os = require("os");
const router = require("./routes/index");
const { setupSwaggerRoutes } = require("./configs/swagger.config");
const initSocket = require("./socket/socket");
const {
  initJobScheduler,
  runManually,
} = require("./services/scheduler.service");

// init app
const app = express();
const server = http.createServer(app);

// Initialize scheduler
console.log("Initializing background jobs...");
initJobScheduler();
// runManually();

// init Socket.IO
const { io, emitNotification } = initSocket(server);
app.locals.emitNotification = emitNotification;

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(
  compression({
    level: 6,
    threshold: 100 * 1000,
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// init DB
require("./dbs/init.mongodb");

// init routes
app.use("/api/v1", router);

// Setup all Swagger documentation routes
setupSwaggerRoutes(app);

// handling errors
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server Error",
    stack: error.stack,
  });
});

module.exports = { app, server };
