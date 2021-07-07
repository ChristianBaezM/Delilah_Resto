const jwt = require('jsonwebtoken');
const jwtKey = "password";

const token = {
    generar : ( id, username, rol ) => {
    
        const token = jwt.sign ({
            "id": id,
            "username" : username,
            "rol" : rol
        } , jwtKey )

        return token
    },
    decodificar : ( headers ) => {

        const auth = headers.authorization;
        if ( !auth.startsWith("Bearer ") ) return;
        const token = auth.substring( 7, auth.length );
        const userInfo = jwt.verify( token, jwtKey );
        return userInfo 
    },
}

module.exports = token;