const usuario = {
    crear : 
    `CREATE TABLE IF NOT EXISTS usuario (
        id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(20) NOT NULL,
        nombre VARCHAR(80) NOT NULL,
        email VARCHAR(60) NOT NULL,
        telefono VARCHAR(20) NOT NULL,
        direccion VARCHAR(80) NOT NULL,
        contrasena VARCHAR(50) NOT NULL,
        rol VARCHAR(10) NULL DEFAULT 'usuario',
        PRIMARY KEY (id) USING BTREE,
        UNIQUE (username)
    )`,
    crearRegistros : 
    `INSERT INTO usuario (username,nombre,email,telefono,direccion,contrasena,rol)
	VALUES 
	("pedropicapiedra","Pedro Picapiedra","pp@picapiedra.com",1234567,"roca piedra 1","7072a404f9fb33e1805dd6c122e233d3","admin"),
	("pablomarmol","Pablo Marmol","pm@picapiedra.com",9876543,"roca piedra 7","74d3ba786578faa47e2a827aeb82077e","usuario"),
	("vilmapicapiedra","Vilma Picapiedra","vp@picapiedra.com",9638521,"roca piedra 3","bf3aabbc34d94185f5ab97627fd5a2a6","usuario")`,
}

module.exports = usuario