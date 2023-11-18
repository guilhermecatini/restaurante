module.exports = app => {

    const main_page = (req, res) => {
        res.render("main", { data: {} });
    }

    return {
        main_page
    }

}
