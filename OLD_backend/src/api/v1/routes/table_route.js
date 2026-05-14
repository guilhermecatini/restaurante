module.exports = app => {

    const { auth_controller, table_controller } = app.src.api.v1.controllers;

    app.route("/pagelimit/:tablename")
        .post(table_controller.save_page_limit)

    app.route("/usercolumns/:tablename")
        .get(table_controller.list_config)
        .post(table_controller.save_columns)

    app.route("/dt/:tablename")
        .get(table_controller.get)
        .post(table_controller.save_record)

    // app.route("/api/v1/:tablename")
    //     // .all(auth_controller.secureRoute)
    //     .get(table_controller.get)
    // // .post(table_controller.save)

    // app.route("/api/v1/:tablename/conf")
    //     .get(table_controller.conf2)

    // app.route("/oauth2/redirect/google")
    //     .get(auth_controller.googleOauth2Redirect);

    // app.route("/auth/federated/google/success")
    //     .get(auth_controller.authSuccess)

    // app.route("/auth/federated/google/failure")
    //     .get(auth_controller.authFailure)

}
