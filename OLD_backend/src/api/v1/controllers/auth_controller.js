const passport = require("passport");
const GoogleStrategy = require("passport-google-oidc");

module.exports = app => {

    const responseError = {
        error: true,
        message: "Unauthorized"
    };

    /**
     * @description Método para proteger as rotas de requisições
     * 
     */
    const secureRoute = (req, res, next) => {
        try {
            const user = req.session.passport.user;
            if (!user.id) {
                res.status(401).send("<center><strong><h3>Not authorized</h3></strong></center>");
            }
            next()
        } catch (err) {
            res.status(401).send("<center><strong><h3>Not authorized</h3></strong></center>");
        }
    }

    /**
     * @description em caso de sucesso no login no google
     */
    const authSuccess = (req, res) => {
        res.redirect("/cat/nav/ui/classic/main");
    }

    const authSuccess_OLD = (req, res) => {
        res.status(200).json({
            error: false,
            message: "Authenticated successfuly."
        })
    }

    /**
     * @description em caso de falha no login no google
     */
    const authFailure = (req, res) => {
        res.status(401).json({
            error: true,
            message: "Authentication failure."
        })
    }

    /**
     * @description valida o login realizado no google
     */
    const googleOauth2Redirect = passport.authenticate("google", {
        successReturnToOrRedirect: "/auth/federated/google/success",
        failureRedirect: "/auth/federated/google/failure"
    });

    /**
     * @description abre a tela para autenticação no google
     */
    const googlePassportAuthenticate = passport.authenticate("google");


    /**
     * @description configuração do autenticador do google
     */
    passport.use(new GoogleStrategy({
        clientID: process.env["GOOGLE_CLIENT_ID"],
        clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
        callbackURL: "/oauth2/redirect/google",
        scope: ["profile"]
    }, function verify(issuer, profile, cb) {
        let provider = issuer;
        let subject = profile.id;
        app.db("sys_user_federated_credentials")
            .where({
                provider,
                subject
            })
            .then(federated_data => {
                // caso não encontre registro na tabela de credenciais federadas
                if (federated_data.length == 0) {
                    let user = {
                        full_name: profile.displayName
                    };
                    // Insere na tabela de usuario
                    app.db("sys_user")
                        .insert(user)
                        .then(user_data => {
                            let user_id = user_data[0];
                            let federated_credentials = {
                                user_id,
                                provider: issuer,
                                subject: profile.id
                            }
                            // após inserir o usuário na tabela, insere o dado na tabela de credenciais federadas
                            app.db("sys_user_federated_credentials")
                                .insert(federated_credentials)
                                .then(ins_fed_cred => {
                                    let usr = {
                                        id: user_id,
                                        name: profile.displayName
                                    };
                                    return cb(null, usr);
                                })
                                .catch(err => cb(err))
                        })
                        .catch(err => cb(err))
                } else { // caso encontre na tabela de federação, busca o login do usuario no sistema
                    app.db("sys_user")
                        .where({
                            id: federated_data[0].user_id
                        })
                        .then(user => {
                            if (user.length > 0) {
                                return cb(null, user[0]);
                            } else {
                                return cb(null, false);
                            }
                        })
                        .catch(err => cb(err))
                }

            })
            .catch(err => cb(err))
    }));

    passport.serializeUser(function (user, cb) {
        process.nextTick(function () {
            cb(null, { id: user.id, username: user.username, name: user.full_name });
        });
    });

    passport.deserializeUser(function (user, cb) {
        process.nextTick(function () {
            return cb(null, user);
        });
    });

    const basicLogin = (req, res) => {

        let { username, password } = req.body;

        app.db("sys_user")
            .where({
                username,
                password
            })
            .then(data => {
                if (data.length > 0) {

                    let user = data[0];

                    const axObject = {
                        id: user.id,
                        username: user.username,
                        name: user.full_name
                    }

                    req.session.passport = {};
                    req.session.passport.user = {};
                    req.session.passport.user.id = axObject.id;
                    req.session.passport.user.username = axObject.username;
                    req.session.passport.user.name = axObject.name;

                    res.redirect("/cat/nav/ui/classic/main");

                } else {
                    res.status(200).send("Usuário ou senha inválida.");
                }
            })
            .catch(err => {
                res.status(500).send("Error: " + err);
            });
    }

    const logout = (req, res) => {
        req.session.destroy(err => {
            res.status(200).json({ error: false });
        });
    }

    const indexRoute = (req, res) => {
        res.redirect("/cat/nav/ui/classic/login");
    }

    return {
        secureRoute,
        authSuccess,
        authFailure,
        basicLogin,
        logout,
        indexRoute,
        googleOauth2Redirect,
        googlePassportAuthenticate
    }

}