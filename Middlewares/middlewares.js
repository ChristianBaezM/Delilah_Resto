const token = require('./token');

const verificar = {
    administrador : (req,res,next) => {

        const headers = req.headers;
        const userInfo = token.decodificar(headers);
        if (userInfo.rol === "admin") next()
        else res.status(403).send("Acceso no autorizado")
    },
    token : (err, req, res, next) => {
        if (err.name === 'UnauthorizedError') res.status(401).send('No posee un token de autenticación');
    }
}

module.exports = verificar

