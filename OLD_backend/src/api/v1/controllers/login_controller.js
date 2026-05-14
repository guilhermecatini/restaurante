module.exports = app => {

    const login_page = (req, res) => {
        res.render("login", { data: {} });
    }

    const admin_login_page = (req, res) => {
        res.render("admin_login", { data: {} });
    }

    return {
        login_page,
        admin_login_page
    }

}
