

module.exports = app => {



    const save = (req, res) => {
        let { tablename } = req.params;
        let { body } = req;
        let { username } = req.session.passport.user;
        let { id } = req.body;

        if (id) {
            body.updated_by = username;
            body.updated_at = new Date();

            app.db(tablename)
                .update(body)
                .where({ id })
                .then(data => {
                    res.status(200).json(data);
                })
                .catch(err => {
                    res.status(500).json(err);
                });

        } else {

            body.created_by = body.updated_by = username;

            app.db(tablename)
                .insert(body)
                .then(data => {
                    res.status(201).json(data);
                })
                .catch(err => {
                    res.status(500).json(err);
                });
        }
    }

    const fnColumnsMetaData = async tablename => {
        var result;
        var s = app.db.raw(`SELECT * FROM information_schema.columns WHERE TABLE_NAME = '${tablename}'`);
        result = await s.then(data => data)
        return result[0];
    }

    const fnGetTableFields = async tablename => {
        let conf = await fnColumnsMetaData(tablename);
        let fields = [];
        for (let field of conf)
            fields.push(field[`COLUMN_NAME`]);
        return fields;
    }

    const fnValidateTableFields = async (tablename, sysparm_fields) => {

        let table_fields = await fnGetTableFields(tablename);
        let fields = [];

        if (!sysparm_fields)
            return table_fields;

        for (let field of sysparm_fields.split(`,`))
            if (table_fields.includes(field))
                fields.push(field);

        return fields;

    }

    const fnGetUserListConfig = async (tablename) => {
        const user_id = "1";

        const table_columns = await fnGetTableFields(tablename);

        const s = app.db("sys_user_list_config");
        s.where({
            user_id,
            tablename
        })
        let config = await s.then(data => data);

        if (config.length > 0) {

            let user_columns = config[0].columns_config.split(",");
            let { page_limit } = config[0];

            return {
                table_columns,
                user_columns,
                page_limit
            }
        } else {
            const i = app.db("sys_user_list_config");
            const insert_data = {
                user_id,
                tablename,
                columns_config: table_columns.join(","),
                page_limit: 20
            };
            i.insert(insert_data);
            i.then();
            return {
                page_limit: 20,
                table_columns,
                user_columns: table_columns
            };
        }
    }

    const list_config = async (req, res) => {
        let { tablename } = req.params;
        let config = await fnGetUserListConfig(tablename, "1");
        res.status(200).json({ config });
    }

    const save_page_limit = (req, res) => {
        const { tablename } = req.params;
        const { page_limit } = req.body
        const user_id = `1`;

        app.db("sys_user_list_config")
            .where({
                tablename,
                user_id
            })
            .update({
                page_limit
            })
            .then(data => {
                res.status(200).json(data)
            })
    }

    const save_columns = (req, res) => {
        const { tablename } = req.params;
        const { columns_config } = req.body
        const user_id = `1`;

        app.db("sys_user_list_config")
            .where({
                tablename,
                user_id
            })
            .update({
                columns_config
            })
            .then(data => {
                res.status(200).json(data)
            })
    }

    const _getTableName = t => {
        return t.slice(0, t.length - 5);
    }

    const get = async (req, res) => {

        let { tablename } = req.params;

        if (tablename.slice(-5) == "_list") {

            tablename = _getTableName(tablename);

            let { sysparm_query, sysparm_fields, sysparm_limit, sysparm_page } = req.query;

            let items_per_page = sysparm_limit = sysparm_limit ? parseInt(sysparm_limit, 10) : 20;
            sysparm_page = sysparm_page ? parseInt(sysparm_page, 10) : 1;
            let offset = (sysparm_page - 1) * sysparm_limit;

            let fields = await fnValidateTableFields(tablename, sysparm_fields);

            let s = app.db(tablename);
            let cnt = app.db(tablename).count(`*`)

            s.limit(sysparm_limit);
            s.offset(offset);
            s.select(fields);

            if (sysparm_query) {
                s.where(builder => {
                    //var eq = `usernameLIKECartwright69^ORid=5280021^NQemail=Aylin_Anderson58@gmail.com^ORemailLIKEKrystel_Ratke86`;
                    //var eq = `emailLIKEJaron_Ankunding2@hotmail.com^ORid=5280021`;

                    var eq = sysparm_query;

                    eq.split("^").forEach(e => {
                        if (e.includes("=")) {
                            var ax = e.split("=");
                            if (e.slice(0, 2) == "NQ" || e.slice(0, 2) == "OR")
                                builder.orWhere(ax[0].substring(2), `=`, ax[1]);
                            else
                                builder.where(ax[0], `=`, ax[1]);
                        } else if (e.includes("LIKE")) {
                            var ax = e.split("LIKE");
                            if (e.slice(0, 2) == "NQ" || e.slice(0, 2) == "OR")
                                builder.orWhere(ax[0].substring(2), `LIKE`, `%${ax[1]}%`);
                            else
                                builder.where(ax[0], `LIKE`, `%${ax[1]}%`);
                        } else if (e.includes("STARTSWITH")) {
                            var ax = e.split("STARTSWITH");
                            if (e.slice(0, 2) == "NQ" || e.slice(0, 2) == "OR")
                                builder.orWhere(ax[0].substring(2), `LIKE`, `${ax[1]}%`);
                            else
                                builder.where(ax[0], `LIKE`, `${ax[1]}%`);
                        }
                    })
                })
                cnt.where(builder => {
                    //var eq = `usernameLIKECartwright69^ORid=5280021^NQemail=Aylin_Anderson58@gmail.com^ORemailLIKEKrystel_Ratke86`;
                    //var eq = `emailLIKEJaron_Ankunding2@hotmail.com^ORid=5280021`;

                    var eq = sysparm_query;

                    eq.split("^").forEach(e => {
                        if (e.includes("=")) {
                            var ax = e.split("=");
                            if (e.slice(0, 2) == "NQ" || e.slice(0, 2) == "OR")
                                builder.orWhere(ax[0].substring(2), `=`, ax[1]);
                            else
                                builder.where(ax[0], `=`, ax[1]);
                        } else if (e.includes("LIKE")) {
                            var ax = e.split("LIKE");
                            if (e.slice(0, 2) == "NQ" || e.slice(0, 2) == "OR")
                                builder.orWhere(ax[0].substring(2), `LIKE`, `%${ax[1]}%`);
                            else
                                builder.where(ax[0], `LIKE`, `%${ax[1]}%`);
                        } else if (e.includes("STARTSWITH")) {
                            var ax = e.split("STARTSWITH");
                            if (e.slice(0, 2) == "NQ" || e.slice(0, 2) == "OR")
                                builder.orWhere(ax[0].substring(2), `LIKE`, `${ax[1]}%`);
                            else
                                builder.where(ax[0], `LIKE`, `${ax[1]}%`);
                        }
                    })
                })
            }



            let tf = await fnColumnsMetaData(tablename);
            let table_fields = [];

            for (let fd of tf) {
                table_fields.push({
                    label: fd.COLUMN_NAME,
                    name: fd.COLUMN_NAME
                });
            }

            Promise.all([cnt, s]) // Executa as duas consultas em paralelo
                .then(async ([cntResult, result]) => {

                    const count = cntResult[0]['count(*)'];
                    const pages = Math.ceil(count / sysparm_limit);
                    const page = sysparm_page;

                    res.render('data_list', {
                        data: {
                            tablename,
                            count,
                            pages,
                            page,
                            items_per_page,
                            result,
                            table_fields
                        }
                    })

                    /*res.status(200).json({
                        count,
                        pages,
                        page,
                        items_per_page,
                        result,
                        table_fields
                    });*/
                })
        } else {

            var { sys_id } = req.query;

            const ui_actions = await get_table_ui_actions(tablename);

            var result = await app.db(tablename)
                .where({
                    sys_id
                })
            result = result[0];
            // console.log(result)

            let tf = await fnColumnsMetaData(tablename);
            let table_fields = [];

            for (let fd of tf) {
                table_fields.push({
                    label: fd.COLUMN_NAME,
                    name: fd.COLUMN_NAME,
                    data_type: fd.DATA_TYPE
                });
            }

            table_fields.forEach(f => {
                if (f.data_type == "datetime") {
                    result[f.name] = result[f.name].toISOString().split(".")[0]
                }
            })


            res.render('data_form', {
                data: {
                    ui_actions,
                    table_fields,
                    result
                }
            })


        }

    }


    const get_table_ui_actions = async (tablename) => {
        let ui_actions = await app.db("sys_ui_action")
            .where({
                active: 1,
                tablename
            });
        return ui_actions;
    }




    const save_record = async (req, res) => {

        let { body } = req;
        let { sys_id } = body;
        let { tablename } = req.params;


        let tf = await fnColumnsMetaData(tablename);
        let table_fields = [];

        for (let fd of tf) {
            table_fields.push({
                label: fd.COLUMN_NAME,
                name: fd.COLUMN_NAME,
                data_type: fd.DATA_TYPE
            });
        }

        table_fields.forEach(f => {
            if (f.data_type == "tinyint") {
                body[f.name] = body[f.name] == "on" ? 1 : 0;
            }
        })

        let result = await app.db(tablename)
            .where({
                sys_id
            })
            .update(body)


        res.redirect(req.url);

        //res.redirect(`/dt/${tablename}?sys_id=${sys_id}`)

    }

    return {
        save_page_limit,
        list_config,
        save_columns,
        save_record,
        get
    };

}
