
const express = require("express");
const expressJwt = require('express-jwt');
const md5 = require('md5');
const moment = require('moment');
const verificar = require('./Middlewares/middlewares');
const token = require('./Middlewares/token');

const server = express();
const jwtKey = "password";

server.use(express.json());
server.use(expressJwt({ secret :jwtKey, algorithms: ['HS256'] }).unless({ 
	path: ['/usuario/login','/usuario/registro'] 
})); 
server.use( verificar.token );

const init = require('./Tablas/conexion');
let sequelize; 
init().then( s => sequelize = s);

if (process.env.APP_PORT) PORT = process.env.APP_PORT;
else PORT = 3000; 

server.get ( '/productos', ( request , response ) => {
	sequelize.query("SELECT * FROM producto", { type: sequelize.QueryTypes.SELECT })
	.then( data => response.status(200).json(data))
	.catch( err => response.status(400).send("Error: " + err));
});
server.get( '/productos/:id', ( request , response ) => {
	
	const id = request.params.id;
	sequelize.query("SELECT * FROM producto WHERE id = :_id", { 
		replacements: { _id : id },  
		type: sequelize.QueryTypes.SELECT
	})
	.then( data => {
		if (data.length === 0) response.status(404).send('Verifique el ID solicitado');
		else response.status(200).json(data)
	})
	.catch( err => response.status(404).send("Error: " + err));
});
server.post( '/productos', verificar.administrador, ( request , response ) => {

	const { nombre , precio } = request.body;
	let { disponible } = request.body;
	if (!disponible) disponible = "Y";
	
	sequelize.query("INSERT INTO producto ( nombre , precio , disponible ) VALUES ( :_nombre , :_precio , :_disponible )", { 
		replacements: { 
			_nombre : nombre,
			_precio : precio,
			_disponible : disponible 
		}
	})
		.then( data => response.status(201).send(`Se agregó el producto ${nombre}`))
		.catch( err => response.status(400).send("Error: " + err));
});
server.put( '/productos/:id', verificar.administrador, ( request , response ) => {
	
	const id = request.params.id;
	const { nombre , precio , disponible } = request.body;
	sequelize.query(
		`UPDATE producto SET nombre = :_nombre , precio = :_precio , disponible = :_disponible
		WHERE id = :_id`, { 
			replacements: {
				_id : id, 
				_nombre : nombre,
				_precio : precio,
				_disponible : disponible 
			}
		})
		.then( data => {
			if (data[0].affectedRows === 0) response.status(404).send('El producto no fue actualizado, introduzca cambios o un ID existente');
			else response.status(201).send(`El producto ${nombre} fue actualizado`);
		})
		.catch( err => response.status(400).send("Error: " + err));
});
server.delete( '/productos/:id', verificar.administrador, async ( request , response ) => {

	const id = request.params.id;
	
	const estado = await sequelize.query(
		`SELECT disponible FROM producto 
		WHERE id = :_id`, { 
			replacements: { _id : id },
			type: sequelize.QueryTypes.SELECT
		})

	if (estado.length === 0) response.status(404).send('Verifique el ID');
	   
	sequelize.query(
		`UPDATE producto SET disponible = 'N'
			WHERE id = :_id`, { 
			replacements: { _id : id },
		})
		.then( data => response.status(200).send("El producto ya no estará disponible"))
		.catch( err => response.status(404).send("Error: " + err));
});

server.get( '/usuario', async (request, response) => {

	const { id }  = token.decodificar(request.headers);
	const usuarioActual = await sequelize.query("SELECT username, nombre, email, telefono, direccion FROM usuario WHERE id = :_id", { 
		type: sequelize.QueryTypes.SELECT ,
		replacements : {
			_id : id
		}
	});
	response.status(200).json(usuarioActual[0])
});
server.get( '/usuario/:id', verificar.administrador, async (request, response) => {

	const id = request.params.id;
	const userInfo = await sequelize.query("SELECT username, nombre, email, telefono, direccion FROM usuario WHERE id = :_id", { 
		type: sequelize.QueryTypes.SELECT ,
		replacements : {
			_id : id
		}
	});

	if (userInfo.length === 0) response.status(404).send('Verifique el ID');
	else response.status(200).json(userInfo[0]);
});
server.post( '/usuario/registro', (request, response) => {
	const { username, nombre, email, telefono, direccion } = request.body;
	let { contrasena, rol } = request.body;
	if (!rol) rol = "usuario";
	contrasena = md5(contrasena);

	sequelize.query(
	`INSERT INTO usuario ( username, nombre, email, direccion, telefono, contrasena, rol ) 
	VALUES ( :_username, :_nombre, :_email, :_direccion, :_telefono, :_contrasena, :_rol )`,{
		replacements: {
			_username : username, 
			_nombre : nombre, 
			_email : email, 
			_direccion : direccion, 
			_telefono : telefono,
			_contrasena : contrasena, 
			_rol : rol
			},
		  }
	)
	.then((data) => response.status(201).send(`Se creo el usuario ${nombre}!`))
	.catch((err) => {
		console.log(err)
		const error = err.original.errno = 1062 ? `El nombre de usuario "${username}", ya esta en uso.` : err;
		response.status(400).send("Error: " + error)          
	});
});
server.post( '/usuario/login', ( request, response ) => {
	const { username } = request.body;
	let { contrasena } = request.body;
	contrasena = md5(contrasena);
	sequelize.query(
		`SELECT * FROM usuario
		WHERE username = :_username`
		, {
			type: sequelize.QueryTypes.SELECT,
			replacements : {
				_username : username,
			}
		}
	)
	.then( data => {
		const queryRes = data[0];
		
		if ( queryRes == undefined ) {
			 return response.status(401).send("Porfavor registrese");
		}   
		
		if ( queryRes.contrasena == contrasena ) {
			const { id, username, rol } = queryRes;
			const authToken = token.generar ( id, username, rol );
			response.status(200).send( authToken);
		}
		else {
			response.status(401).send("Usuario o clave invalidos");
		}
	})
	.catch( err => response.status(404).send("Error: " + err));
});
server.get( '/usuarios', verificar.administrador, async (request, response) => {

	const usuarios = await sequelize.query("SELECT username, nombre, email, telefono, direccion, rol FROM usuario", { 
		type: sequelize.QueryTypes.SELECT
	});
	response.status(200).json(usuarios);
});

server.get( '/pedido', async ( request, response ) => {

	const { id } = token.decodificar(request.headers);

	let pedidos = await sequelize.query(
		`SELECT p.id AS "pedidoID", u.nombre AS "nombre", p.direccion_envio AS "direccion_envio", u.telefono, p.total, p.estado_pedido
			FROM dr.usuario AS u, dr.pedido AS p
			WHERE u.id = p.usuario_id
			AND u.id = :_usuarioID
			ORDER BY p.id`, 
		{   type: sequelize.QueryTypes.SELECT,
			replacements : {
				_usuarioID : id
			}}
	);

	for (const pedido of pedidos) {
		
		const pedidoID = pedido.pedidoID;
		const items = await sequelize.query(
			`SELECT p.nombre, p.precio, i.cantidad
				FROM dr.producto AS p, dr.pedido AS o, dr.item AS i
				WHERE o.id = i.pedido_id AND p.id = i.producto_id 
				AND o.id = :_pedidoID
				ORDER BY p.precio`, {   
				type: sequelize.QueryTypes.SELECT,
				replacements : {
					_pedidoID : pedidoID
				}
			});
		pedido.items = items;
	}
	response.status(200).json(pedidos);
});
server.post( '/pedido', async ( request, response ) => {

	const { items, direccion_envio } = request.body;
	const { id, username } = token.decodificar(request.headers);

	let total = 0, itemsPrecios = [];

	for (const item of items) {
		
		const data = await sequelize.query( 
		`SELECT precio 
			FROM producto
			WHERE id = :_id`, {
			type: sequelize.QueryTypes.SELECT,
			replacements : {
			_id : item.id,
			}
		});
		total += ( data[0].precio * item.cantidad);
		itemsPrecios.push(data[0].precio);
	};
	
	const fecha_hora = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
	
	await sequelize.query(
		`INSERT INTO dr.pedido ( usuario_id, fecha_hora, total, direccion_envio ) 
		VALUES ( :_usuario_id, :_fecha_hora, :_total, :_direccion_envio )`, {
			replacements: {
				_usuario_id : id, 
				_fecha_hora : fecha_hora, 
				_total : total,
				_direccion_envio : direccion_envio 
			}
		}
	);

	const idPedido = await sequelize.query(
		`SELECT id FROM dr.pedido ORDER BY id DESC LIMIT 1`,
		{type: sequelize.QueryTypes.SELECT}
	);

	for (const [ index, item ] of items.entries()) {
		
		await sequelize.query(
			`INSERT INTO dr.item ( pedido_id, producto_id, precio, cantidad ) 
			VALUES ( :_pedido_id , :_producto_id, :_precio, :_cantidad )`, {
				replacements: {
					_pedido_id : idPedido[0].id, 
					_producto_id : item.id, 
					_precio : itemsPrecios[index],
					_cantidad : item.cantidad
				}
			}
		);
	};
	response.status(201).send(`Se creó un nuevo pedido con el id "${idPedido[0].id}"`);
});
server.put( '/pedido/:id', verificar.administrador,  async ( request,response ) => {

	const id = request.params.id;
	const { estado } = request.body;

	if ( estado!= "nuevo" && estado!= "confirmado" && estado!= "preparando" && estado!= "enviando" && estado!= "entregado") {
		return response.status(404).send(`Por favor colocar un nuevo estado valido`);
	}

	sequelize.query(
		`UPDATE dr.pedido SET estado_pedido= :_estado_pedido
		WHERE id = :_id`, { 
			replacements: {
				_id : id, 
				_estado_pedido : estado
			}
		})
		.then( data => {
			if (data[0].affectedRows === 0) response.status(404).send('El estado ya fue configurado o el ID es incorrecto, verifique');
			else response.status(201).send(`El pedido esta "${estado}"`);
		})
		.catch( err => response.status(400).send("Error: " + err));
});
server.delete( '/pedido/:id', verificar.administrador,  async ( request , response ) => {

        const id = request.params.id;
        
        const estado = await sequelize.query(
            `SELECT estado_pedido FROM dr.pedido
            WHERE id = :_id`, { 
                replacements: { _id : id },
                type: sequelize.QueryTypes.SELECT
            })

        if (estado.length === 0) response.status(404).send('Verifique el ID');

        sequelize.query(
            `UPDATE dr.pedido SET estado_pedido = 'cancelado'
                WHERE id = :_id`, { 
                replacements: { _id : id },
            })
            .then( data => response.status(200).send(`El pedido con id ${id} ha sido cancelado`))
            .catch( err => response.status(404).send("Error: " + err));
    });
server.get( '/pedidos', verificar.administrador, async ( request, response ) => {

	let pedidos = await sequelize.query(
		`SELECT o.id AS "pedidoID", u.nombre AS "nombre", o.direccion_envio , u.telefono, o.total, o.estado_pedido
			FROM dr.usuario AS u, dr.pedido AS o
			WHERE u.id = o.usuario_id
			ORDER BY o.id`, 
		{  type: sequelize.QueryTypes.SELECT }
	);

	for (const pedido of pedidos) {
		
		const pedidoID = pedido.pedidoID;
		const items = await sequelize.query(
			`SELECT p.nombre, p.precio, i.cantidad
				FROM dr.producto AS p, dr.pedido AS o, dr.item AS i
				WHERE o.id = i.pedido_id AND p.id = i.producto_id 
				AND o.id = :_pedidoID
				ORDER BY p.precio`, {   
				type: sequelize.QueryTypes.SELECT,
				replacements : {
					_pedidoID : pedidoID
				}
			});
		pedido.items = items;
	}
	response.status(200).json(pedidos);
} );

server.listen(PORT, () => { console.log(`Servidor en el puerto ${PORT}`)});