// Importation du module Router depuis Express pour créer un sous-routeur
const { Router } = require('express');

// Importation du contrôleur qui gère la logique des routes produits
const productsController = require('../controller/products.controller');

// Création d'une instance de routeur pour définir les routes de ce module
const router = Router();

// Je definis les endpoints
router.get('/', productsController.listProducts);
router.get('/:id', productsController.getProductById);
router.post('/', productsController.createProduct);


module.exports = router;

