// import du packet express
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

// creer l'application express
const app = express();

app.get('/test', (req, res) => {
    console.log('Ok coté console');
    res.send('Ok coté client');
}) 

// export app
module.exports = app;