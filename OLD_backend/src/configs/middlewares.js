const cluster = require("cluster");
const numCPUs = require('os').cpus().length;
const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const config = require("../../knexfile");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);


module.exports = app => {

    app.session = session;
    app.session_store = new MySQLStore(config.connection, app.db);

    // view engine config
    app.set('views', "views");
    app.set("view engine", "pug");

    app.use(cors());
    app.use(express.static("views/script"))
    app.use(logger("dev"));
    app.use(express.json({ limit: "18mb" }));
    app.use(express.urlencoded({ extended: false, limit: "18mb" }));
    //app.use(cookieParser()))
    app.use(session({
        secret: "s5fRuAdDEtqeqYze7BjeQvMFwstLLs5xvk7AET2NUhe7A4JY6pf6dd38rwG9qSYB",
        resave: false,
        key: "SESSION.ID",
        saveUninitialized: true,
        cookie: { path: "/", httpOnly: true, secure: false, maxAge: null },
        store: app.session_store
    }));
}
