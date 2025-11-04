// charge les variables d'environement de .env
require('dotenv').config();

// import du fichier "app.js"
const app = require('./app');

// recupere le PORT
const PORT = process.env.PORT;

// verifie que le PORT existe
if(!PORT){
    console.log('PORT absent veuillez compléter le fichier .env');
    // stop le programme de lancement de node
    process.exit(1);
}

// Démarre le serveur Express et log quand il écoute sur le port choisi
app.listen(PORT, ()=>{
    console.log('server lancé sur le port 3000');
    
})





