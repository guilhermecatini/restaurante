const consign = require("consign")
const app = require("express")()
const db = require("./src/configs/db")

process.env.GOOGLE_CLIENT_ID = "331252893808-7676pslt95csnhabf55og23mvajt5job.apps.googleusercontent.com";
process.env.GOOGLE_CLIENT_SECRET = "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";

consign()
    .include("./src/configs/middlewares.js")
    .then("./src/api/v1/controllers")
    .then("./src/api/v1/routes")
    .into(app)

app.db = db

module.exports = app
