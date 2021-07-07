const producto = {
    crear : 
    `CREATE TABLE IF NOT EXISTS producto (
        id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(50) NOT NULL,
        precio INT(10) UNSIGNED NOT NULL,
        disponible VARCHAR(1) NOT NULL DEFAULT 'S',
        PRIMARY KEY (id),
        UNIQUE (nombre)
    )`,
    crearRegistros :
    `INSERT INTO dr.producto (nombre,precio)
        VALUES  ("Cervecita",3000),
                ("Cerveza",5000),
                ("Vino",28000),
                ("Aguardiente",35000),
                ("Whiskey",45000)`, 
}

module.exports = producto