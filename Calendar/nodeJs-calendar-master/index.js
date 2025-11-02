require ('dotenv').config(); 
const express = require('express');
const { dbConnection } = require('./database/config');
const cors = require('cors');


console.log(process.env);

//Crear el servidor de express 

const app = express();

//Base de datos 
dbConnection();

// CORS
app.use(cors());


//Directorio public

app.use(express.static('public'));

//Lectura y parseo del body
app.use( express.json() );


// Rutas
app.use('/api/auth', require('./routes/auth') );
app.use('/api/events', require('./routes/events') );
app.use('/api/categories', require('./routes/categories') ); 
app.use('/api/share', require('./routes/share') ); 



//Escuchar peticiones 

app.listen( process.env.PORT, () => {
    console.log(`Servidor corriendo en puerto ${ process.env.PORT }`);
});

