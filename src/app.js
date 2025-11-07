// import du packet express
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const router = require('./routes');
const notFound = require('./middlewares/notFound');

// creer l'application express
const app = express();

// Middleware CORS : autoriser les request cross origin (ex: React → Express
app.use(cors());

// parse le contenu du body de ma request
app.use(express.json());

// Middleware de log : affiche les requêtes HTTP dans la console
app.use(morgan('dev'));

// chercher toutes mes routes (sous la route /monApi)
app.use('/monapi', router);

// Je recupere la requete qui n'a pas trouvé de route
app.use(notFound);

// export app
module.exports = app;