// import du packet express
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const router = require('./routes');

// creer l'application express
const app = express();

// Middleware CORS : autoriser les request cross origin (ex: React → Express
app.use(cors());

// parse le contenudu body de ma request
app.use(express.json());

// Middleware de log : affiche les requêtes HTTP dans la console
app.use(morgan('dev'));

// chercher toutes mes routes (sous la route /monApi)
app.use('/monApi', router);

// app.post('/test', (req, res) => {
//     const dataBody = req.body;
//     console.log('Ok coté console', dataBody);
//     res.status(200).json({
//         success: true,
//         message: 'Ok coté client'
//     });
// }) 

// export app
module.exports = app;