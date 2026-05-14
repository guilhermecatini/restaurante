module.exports = app => {

    const render_form = (req, res) => {
        let { id } = req.params;
        if (id) {
            app.db("scripthelp")
                .where({ id })
                .then(data => {
                    data = data[0];
                    res.render("scripthelp_form", { data });
                })
        } else {
            res.render("scripthelp_form", { data: {} });
        }
    }

    const render_list = (req, res) => {
        res.render("scripthelp_list", { data: {} });
    }

    const save = (req, res) => {

        let { body } = req;
        let { id } = body;

        if (id) {
            app.db("scripthelp")
                .where({ id })
                .update(body)
                .then(data => {
                    res.redirect(`/cat/nav/ui/classic/scripthelp/${id}`)
                })
                .catch(err => {
                    res.send(err);
                });
        } else {
            delete body.id;
            app.db("scripthelp")
                .insert(body)
                .then(data => {
                    const newid = data[0];
                    res.redirect(`/cat/nav/ui/classic/scripthelp/${newid}`)
                })
                .catch(err => {
                    res.send(err);
                });
        }

    }

    return {
        render_form,
        render_list,
        save
    }

}
