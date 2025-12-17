// index.js (또는 server.js)

require ('dotenv').config(); 
const express = require('express');
const { dbConnection } = require('./database/config');
const cors = require('cors');

console.log(process.env);

const app = express();

dbConnection();

app.use(cors());


app.use(express.static('public'));

app.use( express.json() );


app.use('/api/auth', require('./routes/auth') );
app.use('/api/events', require('./routes/events') );
app.use('/api/categories', require('./routes/categories') ); 
app.use('/api/share', require('./routes/share') ); 
app.use('/api/ai', require('./routes/ai')); // AI 라우트 정상 연결 확인


app.listen( process.env.PORT, () => {
    console.log(`Servidor corriendo en puerto ${ process.env.PORT }`);
});