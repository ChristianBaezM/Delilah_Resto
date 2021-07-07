const pedido = {
    crear : 
    `CREATE TABLE IF NOT EXISTS dr.pedido (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        usuario_id INT UNSIGNED NOT NULL,
        fecha_hora DATETIME NOT NULL,
        total INT UNSIGNED NOT NULL,
        direccion_envio VARCHAR(80) NOT NULL,
        estado_pedido VARCHAR(15) NULL DEFAULT 'nuevo',
        PRIMARY KEY (id),
        FOREIGN KEY (usuario_id)
        REFERENCES usuario (id)
    )`,
    crearRegistros :
    `INSERT INTO dr.pedido ( usuario_id, fecha_hora, total, direccion_envio ) 
        VALUES 
        ( 1, "2021-06-29 08:07:31", 20000, "roca piedra 1" ),
        ( 2, "2021-07-01 09:31:46", 64000, "roca piedra 2" ),
        ( 3, "2021-07-01 03:18:14", 71000, "roca piedra 3" )`
}

module.exports = pedido