// J'importe Routeur de express
const { Router } = require('express');

// Je creer mon router
const router = Router();

// montage des sous routes
// route produits /monapi/product
router.use('/products', require('./products.routes'));

// J'exporte le routeur
module.exports = router;