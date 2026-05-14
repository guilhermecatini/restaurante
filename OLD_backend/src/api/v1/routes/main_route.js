module.exports = app => {

    const { auth_controller, main_controller } = app.src.api.v1.controllers;

    app.route("/cat/nav/ui/classic/main")
        .all(auth_controller.secureRoute)
        .get(main_controller.main_page);

    // app.route("/oauth2/redirect/google")
    //     .get(auth_controller.googleOauth2Redirect);

    // app.route("/auth/federated/google/success")
    //     .get(auth_controller.authSuccess)

    // app.route("/auth/federated/google/failure")
    //     .get(auth_controller.authFailure)

}
