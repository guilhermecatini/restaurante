module.exports = app => {

    const { login_controller } = app.src.api.v1.controllers;

    app.route("/cat/nav/ui/classic/login")
        .get(login_controller.login_page);

    app.route("/cat/nav/ui/classic/admin_login")
        .get(login_controller.admin_login_page);

    // app.route("/oauth2/redirect/google")
    //     .get(auth_controller.googleOauth2Redirect);

    // app.route("/auth/federated/google/success")
    //     .get(auth_controller.authSuccess)

    // app.route("/auth/federated/google/failure")
    //     .get(auth_controller.authFailure)

}
