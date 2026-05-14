module.exports = app => {

    const { auth_controller } = app.src.api.v1.controllers;

    app.route("/")
        .get(auth_controller.indexRoute)

    app.route("/auth/federated/google")
        .get(auth_controller.googlePassportAuthenticate);

    app.route("/oauth2/redirect/google")
        .get(auth_controller.googleOauth2Redirect);

    app.route("/auth/federated/google/success")
        .get(auth_controller.authSuccess)

    app.route("/auth/federated/google/failure")
        .get(auth_controller.authFailure)

    app.route("/auth/basic")
        .post(auth_controller.basicLogin)

    app.route("/auth/logout")
        .get(auth_controller.logout)

}
