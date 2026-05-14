module.exports = app => {

    const { faker_controller } = app.src.api.v1.controllers;

    app.route("/api/v1/faker/names/:page")
        .get(faker_controller.names)

    app.route("/api/v1/faker/generate")
        .get(faker_controller.generate)

    app.route("/api/v1/table/:tablename")
        .get(faker_controller.getdata)



}
