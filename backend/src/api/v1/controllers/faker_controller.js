const faker = require("@faker-js/faker").faker;
const jsep = require('jsep');


module.exports = app => {

    const _createRandomUser = function () {
        const ax = {
            userId: faker.datatype.uuid(),
            username: faker.internet.userName(),
            email: faker.internet.email(),
            avatar: faker.image.avatar(),
            password: faker.internet.password(),
            birthdate: faker.date.birthdate(),
            registeredAt: faker.date.past(),
        };
        return ax;
    }

    const names = (req, res) => {
        const page = parseInt(req.params.page); // Converte o parâmetro da página para um número inteiro
        const username = req.query.username;
        const limit = 10; // Define o número de itens por página
        const offset = (page - 1) * limit; // Calcula o deslocamento (offset) com base na página solicitada e no limite de itens por página

        let countQuery = app.db.count('*').from('fake_user').where("username", "like", `%${username}%`); // Contagem de todos os registros
        let dataQuery = app.db.select('*').from('fake_user').where("username", "like", `%${username}%`).limit(limit).offset(offset); // Seleção de dados da página solicitada

        Promise.all([countQuery, dataQuery]) // Executa as duas consultas em paralelo
            .then(([countResult, dataResult]) => {
                const count = countResult[0]['count(*)'];
                const pages = Math.ceil(count / limit);

                res.json({
                    count: count,
                    pages: pages,
                    data: dataResult,
                });
            })
            .catch((error) => {
                console.error(error);
                res.status(500).json({ message: 'Erro interno do servidor' });
            });
    }

    const getdata = (req, res) => {



        try {
            const tablename = req.params.tablename;
            const sysparm_limit = req.query.sysparm_limit ? req.query.sysparm_limit : 10;
            const sysparm_fields = req.query.sysparm_fields ? req.query.sysparm_fields : "";
            const sysparm_query = req.query.sysparm_query ? req.query.sysparm_query : "";

            const con = app.db(tablename);

            if (sysparm_limit)
                con.limit(sysparm_limit);

            if (sysparm_fields)
                con.select(sysparm_fields.split(","));

            if (sysparm_query) {
                function parseExpression(expression) {
                    jsep.addBinaryOp("=");
                    const ast = jsep(expression);

                    return ast;

                    switch (ast.type) {
                        case 'BinaryExpression':
                            return {
                                column: ast.left.name,
                                operator: ast.operator,
                                value: ast.right.value,
                                type: "BinaryExpression"
                            };
                        case 'LogicalExpression':
                            return {
                                operator: ast.operator,
                                left: parseExpression(ast.left),
                                right: parseExpression(ast.right),
                                type: "LogicalExpression"
                            };
                        default:
                            throw new Error(`Unsupported expression type: ${ast.type}`);
                    }
                }
                var c = parseExpression("id=5280021 OR id=5280022");
                var cc = c.body

                // res.json(condition)
                // return;

                con.where(builder => {

                    for (condition of cc) {

                    

                        if (condition.type === 'BinaryExpression') {
                            // console.log(condition)
                            // return
                            builder.where(condition.left.name, condition.operator, condition.right.value);
                        } else if (condition.type === 'LogicalExpression') {
                            console.log("aeeeee")
                            builder.where(builder => {
                                if (condition.operator === 'OR') {
                                    builder.orWhere(builder => {
                                        parseCondition(condition.left, builder);
                                    }).orWhere(builder => {
                                        parseCondition(condition.right, builder);
                                    });
                                } else if (condition.operator === 'AND') {
                                    builder.where(builder => {
                                        parseCondition(condition.left, builder);
                                    }).where(builder => {
                                        parseCondition(condition.right, builder);
                                    });
                                }
                            });
                        }
                    }



                });
            }



            con.then((data, err) => {
                res.json(data);
            });



        } catch (e) {
            console.log(e)
            res.json(e)
        }




    }

    const generate = (req, res) => {
        var nomes_gerados = [];
        for (var i = 0; i < 10000; i++)
            nomes_gerados.push(_createRandomUser());
        app.db("fake_user")
            .insert(nomes_gerados)
            .then();
        res.json({ error: false });
    }

    return {
        names,
        generate,
        getdata
    }

}