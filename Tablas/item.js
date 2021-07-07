const item = {
    crear :
    `CREATE TABLE IF NOT EXISTS item (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        pedido_id INT UNSIGNED NOT NULL,
        producto_id INT UNSIGNED NOT NULL,
        precio INT UNSIGNED NOT NULL,
        cantidad INT UNSIGNED NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (pedido_id) REFERENCES dr.pedido (id),
        FOREIGN KEY (producto_id) REFERENCES producto (id)
    )`,
    crearRegistros :
    `INSERT INTO dr.item ( pedido_id, producto_id, precio, cantidad ) 
        VALUES 
        ( 1, 1, 3000, 5 ), ( 1, 2, 5000, 1 ),
        ( 2, 1, 3000, 1 ), ( 2, 2, 5000, 1 ), ( 2, 3, 28000, 2 ),
        ( 3, 1, 3000, 1 ), ( 3, 2, 5000, 1 ), ( 3, 3, 28000, 1 ), ( 3, 4, 35000, 1 )`
}

module.exports = item