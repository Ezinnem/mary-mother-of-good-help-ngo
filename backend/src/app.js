// src/app.js

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const fellowRoutes = require("./routes/fellow.routes");
const companyRoutes = require("./routes/company.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/fellows", fellowRoutes);
app.use("/api/companies", companyRoutes);

app.get("/", (_, res) => res.send("Mary, Mother of Good Help API running"));

module.exports = app;
