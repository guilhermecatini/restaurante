module.exports = app => {

    const { auth_controller, scripthelp_controller } = app.src.api.v1.controllers;

    app.route("/cat/nav/ui/classic/scripthelp")
        .all(auth_controller.secureRoute)
        .get(scripthelp_controller.render_form)
        .post(scripthelp_controller.save)

    app.route("/cat/nav/ui/classic/scripthelp_list")
        .all(auth_controller.secureRoute)
        .get(scripthelp_controller.render_list)

    app.route("/cat/nav/ui/classic/scripthelp/:id")
        .all(auth_controller.secureRoute)
        .get(scripthelp_controller.render_form);

    // app.route("/oauth2/redirect/google")
    //     .get(auth_controller.googleOauth2Redirect);

    // app.route("/auth/federated/google/success")
    //     .get(auth_controller.authSuccess)

    // app.route("/auth/federated/google/failure")
    //     .get(auth_controller.authFailure)

}
