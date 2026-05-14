module.exports = app => {

    const { auth_controller, user_controller } = app.src.api.v1.controllers;

    app.route("/api/v1/user")
        .all(auth_controller.secureRoute)
        .get(user_controller.getLoggedUser)
        .post(user_controller.updateLoggedUser)
        


}