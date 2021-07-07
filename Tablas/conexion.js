const mysql = require('mysql2/promise');
const Sequelize = require('sequelize');
const dc = require('../datos_conexion');
const db = "dr";

const item = require('./item');
const pedido = require('./pedido');
const producto = require('./producto');
const usuario = require('./usuario');

async function init() {

    const ruta = `mysql://${dc.user}:${dc.password}@${dc.host}:${dc.port}/${db}`;

    const conexion = await mysql.createConnection(dc);
    await conexion.query(`DROP DATABASE IF EXISTS ${db};`);
    await conexion.query(`CREATE DATABASE IF NOT EXISTS ${db};`);
    console.log(`Se creo la base de datos ${db}`);

    const sequelize = new Sequelize( ruta , { logging : false } );
    sequelize.authenticate()
        .then( console.log( `Conectado a la base de datos ${db}`) )
        .catch( err => console.error('Error de conexion:', err) );

    await sequelize.query(producto.crear);
    await sequelize.query(usuario.crear);
    await sequelize.query(pedido.crear);
    await sequelize.query(item.crear);

    await sequelize.query(usuario.crearRegistros);
    await sequelize.query(producto.crearRegistros);
    await sequelize.query(pedido.crearRegistros);
    await sequelize.query(item.crearRegistros);
    console.log('Tablas y registros listos !');

    return sequelize
}

module.exports = init;




