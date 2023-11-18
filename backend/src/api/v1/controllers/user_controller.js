module.exports = app => {


    const getLoggedUser = (req, res) => {
        const user_id = req.session.passport.user.id;
        app.db("sys_user")
            .where({ id: user_id })
            .then(user => {
                res.status(200).json(user[0]);
            })
            .catch(err => {
                res.status(500).json({
                    error: true,
                    message: err
                })
            })
    }

    const updateLoggedUser = (req, res) => {

        const user_id = req.session.passport.user.id;

        var userUpdateModel = {
            username: null,
            full_name: null,
            email: null,
            phone: null
        }

        for (key in userUpdateModel) {
            userUpdateModel[key] = req.body[key];
        }

        app.db("sys_user")
            .update(userUpdateModel)
            .where({ id: user_id })
            .then(user => {
                res.status(200).json({
                    error: false,
                    message: "User has ben updated."
                })
            })
            .catch(err => {
                res.status(500).json({
                    error: true,
                    message: err
                })
            })

    }

    return {
        getLoggedUser,
        updateLoggedUser
    }

}
