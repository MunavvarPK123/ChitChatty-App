const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const dbconfig = require('./config/dbConfig');

const server = require('./app');

const port = process.env.PORT || process.env.PORT_NUMBER || 3000;
const host = '0.0.0.0';

server.listen(port, host, () => {
    console.log(`Listening to requests on Host: ${host} and PORT: ${port}`);
});
