# Cours : Structure Express avec Sequelize et MySQL

## Table des matières

1. [Installation et configuration initiale](#1-installation-et-configuration-initiale)
2. [Structure des dossiers](#2-structure-des-dossiers)
3. [Configuration de la base de données](#3-configuration-de-la-base-de-données)
4. [Création des modèles](#4-création-des-modèles)
5. [Création des migrations](#5-création-des-migrations)
6. [Création des contrôleurs](#6-création-des-contrôleurs)
7. [Création des routes](#7-création-des-routes)
8. [Middlewares personnalisés](#8-middlewares-personnalisés)
9. [Validation des données](#9-validation-des-données)
10. [Upload de fichiers](#10-upload-de-fichiers)
11. [Configuration de l'application Express](#11-configuration-de-lapplication-express)

---

## 1. Installation et configuration initiale

### 1.1 Création du projet

```bash
mkdir express_structure
cd express_structure
npm init -y
```

### 1.2 Installation des dépendances

```bash
# Dépendances principales
npm install express cors morgan dotenv sequelize mysql2 multer

# Dépendances de développement
npm install --save-dev nodemon sequelize-cli
```

### 1.3 Configuration du package.json

Ajoutez les scripts suivants dans `package.json` :

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "db:create": "sequelize db:create",
    "db:migrate": "sequelize db:migrate",
    "db:migrate:undo": "sequelize db:migrate:undo",
    "db:seed": "sequelize db:seed:all",
    "db:seed:undo": "sequelize db:seed:undo:all"
  }
}
```

### 1.4 Création du fichier .env

Créez un fichier `.env` à la racine du projet :

```env
PORT=3000
NODE_ENV=development

# Configuration base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=express_structure_db
```

### 1.5 Configuration de Sequelize CLI

Créez un fichier `.sequelizerc` à la racine :

```javascript
const path = require('path');

module.exports = {
    'config': path.resolve('src/config', 'config.js'),
    'models-path': path.resolve('src/models'),
    'seeders-path': path.resolve('src/seeders'),
    'migrations-path': path.resolve('src/migrations')
}
```

---

## 2. Structure des dossiers

Créez la structure suivante :

```
express_structure/
├── .env
├── .sequelizerc
├── package.json
├── package-lock.json
├── uploads/              # Dossier pour les fichiers uploadés
└── src/
    ├── server.js         # Point d'entrée de l'application
    ├── app.js            # Configuration Express
    ├── config/
    │   └── config.js     # Configuration Sequelize
    ├── models/
    │   ├── index.js      # Chargement automatique des modèles
    │   ├── Product.js
    │   ├── Book.js
    │   └── Type.js
    ├── migrations/
    │   ├── 20251110103916-create-health-checks.js
    │   ├── 20251112083016-create-product.js
    │   ├── 20251113101910-create-book.js
    │   ├── 20251114095253-create-type.js
    │   ├── 20251114100238-add-type-id-to-book.js
    │   └── 20251117145441-add-cover-filename-to-book.js
    ├── controllers/
    │   ├── products.controller.js
    │   └── books.controller.js
    ├── routes/
    │   ├── index.js
    │   ├── products.routes.js
    │   └── books.routes.js
    ├── middlewares/
    │   ├── notFound.js
    │   └── uploadBookImage.js
    └── utils/
        └── bookValidation.js
```

---

## 3. Configuration de la base de données

### 3.1 Création de la base de données

```bash
npx sequelize-cli db:create
```

### 3.2 Configuration Sequelize

Créez `src/config/config.js` :

```javascript
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: { 
      decimalNumbers: true
    },
    define: {
      underscored: true  // Utilise snake_case en base de données
    }
  }
}
```

### 3.3 Configuration des modèles (index.js)

Créez `src/models/index.js` :

```javascript
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Chargement automatique de tous les modèles
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Configuration des associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
```

---

## 4. Création des modèles

### 4.1 Modèle Product

Créez `src/models/Product.js` :

```javascript
"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // Définir des relations ici si nécessaire
    }
  }

  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          isDecimal: true,
          min: 0,
        },
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "product",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Product;
};
```

### 4.2 Modèle Type

Créez `src/models/Type.js` :

```javascript
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Type extends Model {
        static associate(models) {
            // Un type possède plusieurs livres
            Type.hasMany(models.Book, {
                as: 'books',
                foreignKey: 'type_id'
            });
        }
    }
    
    Type.init(
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING(150),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [1, 150]
                }
            }
        },
        {
            sequelize,
            modelName: 'Type',
            tableName: 'type',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );
    
    return Type;
};
```

### 4.3 Modèle Book

Créez `src/models/Book.js` :

```javascript
"use strict";

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Book extends Model {
        static associate(models) {
            // Un livre appartient à un seul type
            Book.belongsTo(models.Type, {
                as: "type",
                foreignKey: "type_id"
            });
        }
    }

    Book.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            title: {
                type: DataTypes.STRING(150),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [1, 150]
                }
            },
            author: {
                type: DataTypes.STRING(150),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [1, 150]
                }
            },
            dispo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            type_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "type",
                    key: "id"
                }
            },
            cover_filename: {
                type: DataTypes.STRING(255),
                allowNull: true
            }
        },
        {
            sequelize,
            modelName: "Book",
            tableName: "book",
            underscored: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );
    
    return Book;
};
```

---

## 5. Création des migrations

### 5.1 Migration : Table Product

```bash
npx sequelize-cli migration:generate --name create-product
```

Créez `src/migrations/20251112083016-create-product.js` :

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product');
  }
};
```

### 5.2 Migration : Table Book

```bash
npx sequelize-cli migration:generate --name create-book
```

Créez `src/migrations/20251113101910-create-book.js` :

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('book', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      author: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      dispo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('book');
  }
};
```

### 5.3 Migration : Table Type

```bash
npx sequelize-cli migration:generate --name create-type
```

Créez `src/migrations/20251114095253-create-type.js` :

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('type', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('type');
  }
};
```

### 5.4 Migration : Ajout de type_id à Book

```bash
npx sequelize-cli migration:generate --name add-type-id-to-book
```

Créez `src/migrations/20251114100238-add-type-id-to-book.js` :

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('book', 'type_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'type',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('book', 'type_id');
  }
};
```

### 5.5 Migration : Ajout de cover_filename à Book

```bash
npx sequelize-cli migration:generate --name add-cover-filename-to-book
```

Créez `src/migrations/20251117145441-add-cover-filename-to-book.js` :

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('book', 'cover_filename', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "nom de fichier de la couverture du livre"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('book', 'cover_filename');
  }
};
```

### 5.6 Exécution des migrations

```bash
npx sequelize-cli db:migrate
```

**Important** : Dans les migrations, utilisez toujours le paramètre `Sequelize` (avec majuscule) passé à la fonction, pas une instance importée.

---

## 6. Création des contrôleurs

### 6.1 Contrôleur Products

Créez `src/controllers/products.controller.js` :

```javascript
const db = require('../models');
const Product = db.Product;

// Liste tous les produits
exports.listProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.status(200).json({
            success: true,
            message: 'liste des produits',
            data: products
        });
    } catch (error) {
        console.log('erreur pour get products', error);
        res.status(500).json({
            success: false,
            message: "error sur get products",
            data: null
        });
    }
};

// Récupère un produit par ID
exports.getProductById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "produit non trouvé",
                data: null
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'produit trouvé',
            data: product
        });
    } catch (error) {
        console.log('error sur find by id product', error);
        res.status(500).json({
            success: false,
            message: 'error sur get by product',
            data: null
        });
    }
};

// Crée un nouveau produit
exports.createProduct = async (req, res) => {
    try {
        const { name, price } = req.body;
        
        // Validation des données
        if (!name || !price || typeof price !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'name string et price number obligatoire',
                data: null
            });
        }
        
        const newProduct = await Product.create({
            name: name,
            price: price
        });
        
        res.status(201).json({
            success: true,
            message: 'produit crée',
            data: newProduct
        });
    } catch (error) {
        console.log('error sur creation de product', error);
        res.status(500).json({
            success: false,
            message: 'error sur la creation product',
            data: null
        });
    }
};

// Met à jour un produit
exports.updateProduct = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, price } = req.body;
        
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'produit pas trouvé',
                data: null
            });
        }
        
        if (name) product.name = name;
        if (price !== undefined) product.price = price;
        
        await product.save();
        
        res.status(200).json({
            success: true,
            message: 'produit modifié',
            data: product
        });
    } catch (error) {
        console.log('error sur le update de product', error);
        res.status(500).json({
            success: false,
            message: 'error sur update product',
            data: null
        });
    }
};

// Supprime un produit
exports.deleteProduct = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'produit pas trouvé',
                data: null
            });
        }
        
        await product.destroy();
        
        res.status(204).json();
    } catch (error) {
        console.log('error sur la suppr de product', error);
        res.status(500).json({
            success: false,
            message: 'error sur delete product',
            data: null
        });
    }
};

// Test de connexion à la base de données
exports.test = async (req, res) => {
    try {
        await db.sequelize.authenticate();
        const products = await Product.findAll({ limit: 1 });
        
        res.status(200).json({
            success: true,
            message: 'test de ma table product',
            data: products
        });
    } catch (error) {
        console.error('erreur dans le test de product', error);
        res.status(500).json({
            success: false,
            message: 'echec lors du test de product',
            error: error.message
        });
    }
};
```

### 6.2 Contrôleur Books

Créez `src/controllers/books.controller.js` :

```javascript
const db = require('../models');
const Book = db.Book;
const Type = db.Type;
const { validateCreateBook, validateUpdateBook } = require('../utils/bookValidation');

// Fonction utilitaire pour parser et valider l'ID
function parseId(params) {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }
    return id;
}

// Liste tous les livres avec leur type
exports.listBooks = async (req, res) => {
    try {
        const books = await Book.findAll({
            order: [["title", "ASC"]],
            include: [
                {
                    model: Type,
                    as: 'type',
                    attributes: ['id', 'name']
                }
            ]
        });
        
        return res.status(200).json({
            success: true,
            message: "liste des livres",
            data: books
        });
    } catch (error) {
        console.log("erreur liste books", error);
        return res.status(500).json({
            success: false,
            message: "erreur interne lors de la recuperation des livres",
            data: null
        });
    }
};

// Récupère un livre par ID avec son type
exports.getBookById = async (req, res) => {
    try {
        const id = parseId(req.params);
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'id non valide',
                data: null
            });
        }
        
        const book = await Book.findByPk(id, {
            include: [
                {
                    model: Type,
                    as: "type",
                    attributes: ["id", "name"]
                }
            ]
        });
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "book introuvable",
                data: null
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "livre trouvé",
            data: book
        });
    } catch (error) {
        console.error('echec interne lors de l\'affichage du livre', error);
        return res.status(500).json({
            success: false,
            message: 'erreur interne lors de l\'affichage du livre',
            data: null
        });
    }
};

// Crée un nouveau livre
exports.createdBook = async (req, res) => {
    try {
        const errors = validateCreateBook(req.body);
        
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'erreur de validation des entrées',
                data: errors
            });
        }
        
        const payload = {
            title: req.body.title.trim(),
            author: req.body.author.trim(),
            dispo: typeof req.body.dispo === 'boolean' ? req.body.dispo : true
        };
        
        const newbook = await Book.create(payload);
        
        return res.status(201).json({
            success: true,
            message: 'livre créé',
            data: newbook
        });
    } catch (error) {
        console.error('echec interne lors de la creation du livre', error);
        return res.status(500).json({
            success: false,
            message: 'erreur interne lors de la creation du livre',
            data: null
        });
    }
};

// Met à jour un livre
exports.updateBook = async (req, res) => {
    try {
        const id = parseId(req.params);
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'id non valide',
                data: null
            });
        }
        
        const errors = validateUpdateBook(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "erreur dans la verif des entrées",
                data: errors
            });
        }
        
        const book = await Book.findByPk(id);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "book introuvable",
                data: null
            });
        }
        
        if (typeof req.body.title === "string") {
            book.title = req.body.title.trim();
        }
        if (typeof req.body.author === "string") {
            book.author = req.body.author.trim();
        }
        if (typeof req.body.dispo === "boolean") {
            book.dispo = req.body.dispo;
        }
        
        await book.save();
        
        return res.status(200).json({
            success: true,
            message: "livre modifié",
            data: book
        });
    } catch (error) {
        console.error('echec interne lors de la modification du livre', error);
        return res.status(500).json({
            success: false,
            message: 'erreur interne lors de la modification du livre',
            data: null
        });
    }
};

// Supprime un livre
exports.deleteBook = async (req, res) => {
    try {
        const id = parseId(req.params);
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "id pas bon",
                data: null
            });
        }
        
        const book = await Book.findByPk(id);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "livre introuvable",
                data: null
            });
        }
        
        await book.destroy();
        
        return res.status(204).json();
    } catch (error) {
        console.error('echec interne lors de la suppression du livre', error);
        return res.status(500).json({
            success: false,
            message: 'erreur interne lors de la suppression du livre',
            data: null
        });
    }
};

// Upload de la couverture d'un livre
exports.uploadCover = async (req, res) => {
    try {
        // Vérifie l'ID du livre
        const id = parseId(req.params);
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "id incorrect",
                data: null
            });
        }
        
        // Vérifie si le livre existe
        const book = await Book.findByPk(id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'livre introuvable',
                data: null
            });
        }
        
        // Vérifie qu'un fichier a bien été envoyé
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "aucun fichier envoyé (cover absent)",
                data: null
            });
        }
        
        // Génère l'URL publique de l'image
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        
        // Sauvegarde le nom du fichier en base de données
        book.cover_filename = req.file.filename;
        await book.save();
        
        return res.status(200).json({
            success: true,
            message: "upload cover ok",
            data: {
                bookId: book.id,
                filename: req.file.filename,
                url: imageUrl
            }
        });
    } catch (error) {
        console.error("erreur pendant l'upload d'image", error);
        return res.status(500).json({
            success: false,
            message: "erreur pendant l'upload d'image",
            data: null
        });
    }
};
```

---

## 7. Création des routes

### 7.1 Routes principales (index.js)

Créez `src/routes/index.js` :

```javascript
// Extrait router de express
const { Router } = require('express');

// Crée le routeur
const router = Router();

// Montage des sous-routes
router.use('/products', require('./products.routes'));
router.use('/books', require('./books.routes'));

// Exporte le routeur
module.exports = router;
```

### 7.2 Routes Products

Créez `src/routes/products.routes.js` :

```javascript
const { Router } = require('express');
const productsController = require('../controllers/products.controller');

const router = Router();

// Définir les endpoints
router.get('/test', productsController.test);
router.get('/', productsController.listProducts);
router.get('/:id', productsController.getProductById);
router.post('/', productsController.createProduct);
router.put('/:id', productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

module.exports = router;
```

### 7.3 Routes Books

Créez `src/routes/books.routes.js` :

```javascript
const { Router } = require('express');
const booksController = require('../controllers/books.controller');
const uploadBookImage = require('../middlewares/uploadBookImage');

const router = Router();

// Définir les endpoints
router.get('/', booksController.listBooks);
router.get('/:id', booksController.getBookById);
router.post('/', booksController.createdBook);
router.put('/:id', booksController.updateBook);
router.delete('/:id', booksController.deleteBook);
// Route spéciale pour l'upload d'image book
router.post('/:id/cover', uploadBookImage.single('cover'), booksController.uploadCover);

module.exports = router;
```

---

## 8. Middlewares personnalisés

### 8.1 Middleware 404 (notFound)

Créez `src/middlewares/notFound.js` :

```javascript
// Middleware pour gérer les routes non trouvées
module.exports = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'ressource not found',
        data: null
    });
};
```

### 8.2 Middleware Upload d'images

Créez `src/middlewares/uploadBookImage.js` :

```javascript
const multer = require('multer');
const path = require('path');

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
    // Le dossier de destination => uploads
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    
    // Génération du nom du fichier
    filename: (req, file, cb) => {
        // Récupère l'extension du fichier
        const ext = path.extname(file.originalname);
        // Génère un nom unique pour l'image, ajoute l'extension
        const filename = `book-${req.params.id}-${Date.now()}${ext}`;
        cb(null, filename);
    }
});

// Filtre pour vérifier le type de fichier
function fileFilter(req, file, cb) {
    // Vérifie le mimeType (type de fichier de l'image)
    // Si c'est une image, laisse passer, sinon traite l'erreur
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('format image uniquement !'), false);
    }
}

// Configuration de multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // Limite la taille à 2 MO
    }
});

module.exports = upload;
```

**Important** : Créez le dossier `uploads/` à la racine du projet avant d'utiliser l'upload.

---

## 9. Validation des données

### 9.1 Validation des livres

Créez `src/utils/bookValidation.js` :

```javascript
const MAX_LENGTH = 150;
const { Type } = require('../models');

// Validation pour la création d'un livre
function validateCreateBook(payLoad) {
    const errors = [];
    
    // Vérification qu'on a bien reçu un objet JSON
    if (!payLoad || typeof payLoad !== "object") {
        errors.push("le corps de la requête doit être en json!");
        return errors;
    }
    
    // Récupération des trois données attendues
    const { title, author, dispo } = payLoad;
    
    // Vérification title obligatoire, chaîne non vide et taille limitée
    if (typeof title !== "string" || title.trim().length === 0) {
        errors.push("le titre est obligatoire, il ne doit pas être vide");
    } else if (title.trim().length > MAX_LENGTH) {
        errors.push(`le titre ne doit pas dépasser ${MAX_LENGTH} caractères`);
    }
    
    // Vérification author obligatoire, chaîne non vide et taille limitée
    if (typeof author !== "string" || author.trim().length === 0) {
        errors.push("author est obligatoire, il ne doit pas être vide");
    } else if (author.trim().length > MAX_LENGTH) {
        errors.push(`author ne doit pas dépasser ${MAX_LENGTH} caractères`);
    }
    
    // dispo optionnel à la récupération des données mais il doit être boolean
    if (typeof dispo !== "undefined" && typeof dispo !== "boolean") {
        errors.push("dispo doit être un boolean");
    }
    
    return errors; // Retourne les erreurs ou un tableau vide si tout est bon
}

// Validation pour la mise à jour d'un livre
function validateUpdateBook(payload) {
    const errors = [];
    
    // Vérification qu'on a bien reçu un objet JSON
    if (!payload || typeof payload !== "object") {
        errors.push("le corps de la requête doit être en json!");
        return errors;
    }
    
    // Une mise à jour est utile si au moins une valeur est différente
    if (
        typeof payload.title === "undefined" &&
        typeof payload.author === "undefined" &&
        typeof payload.dispo === "undefined"
    ) {
        errors.push("au moins un champ doit être fourni pour une modification");
        return errors;
    }
    
    return validateCreateBook(payload);
}

// Validation de l'ID de type
async function validateTypeId(typeId) {
    // Vérifie que l'id est bien un id
    if (typeof typeId !== 'number' || !Number.isInteger(typeId) || typeId <= 0) {
        return 'typeId doit être un id';
    }
    
    // Vérifie si le Type existe en db
    const type = await Type.findByPk(typeId);
    if (!type) {
        return 'typeId ne correspond à aucun type';
    }
    
    return null;
}

module.exports = {
    validateCreateBook,
    validateUpdateBook,
    validateTypeId
};
```

---

## 10. Upload de fichiers

### 10.1 Création du dossier uploads

Créez le dossier `uploads/` à la racine du projet :

```bash
mkdir uploads
```

### 10.2 Configuration de l'upload

Le middleware `uploadBookImage.js` est déjà configuré (voir section 8.2).

### 10.3 Utilisation dans les routes

L'upload est utilisé dans la route `POST /books/:id/cover` :

```javascript
router.post('/:id/cover', uploadBookImage.single('cover'), booksController.uploadCover);
```

**Note** : Le nom du champ dans le formulaire doit être `cover`.

### 10.4 Test de l'upload

Avec Postman ou un client HTTP :

- **Méthode** : POST
- **URL** : `http://localhost:3000/monapi/books/1/cover`
- **Body** : `form-data`
- **Clé** : `cover` (type: File)
- **Valeur** : Sélectionnez une image

---

## 11. Configuration de l'application Express

### 11.1 Configuration principale (app.js)

Créez `src/app.js` :

```javascript
// Import des packages express et autres
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const router = require("./routes");
const notFound = require('./middlewares/notFound');

// Crée l'application express
const app = express();

// Autoriser les requêtes cross origin
app.use(cors());

// Parse le contenu du body de la requête (req.body)
app.use(express.json());

// Log les requêtes HTTP
app.use(morgan('dev'));

// Rendre accessible (static) le dossier uploads via l'URL
app.use('/uploads', express.static('uploads'));

// Chercher toutes les routes (sous la route /monapi)
app.use('/monapi', router);

// Récupère la requête qui n'a pas trouvé de route
app.use(notFound);

// Export app
module.exports = app;
```

### 11.2 Point d'entrée (server.js)

Créez `src/server.js` :

```javascript
// Charge les variables d'environnement de .env
require('dotenv').config();

const app = require('./app');

// Récupère le PORT
const PORT = process.env.PORT;

// Vérifie que le port existe
if (!PORT) {
    console.log('PORT absent veuillez compléter le fichier .env');
    // Stop le programme de lancement de node
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`server lancé sur le port ${PORT}`);
});
```

---

## 12. Lancement de l'application

### 12.1 Exécution des migrations

```bash
npx sequelize-cli db:migrate
```

### 12.2 Démarrage du serveur

**Mode développement** (avec nodemon) :
```bash
npm run dev
```

**Mode production** :
```bash
npm start
```

### 12.3 Test des endpoints

**Products** :
- `GET http://localhost:3000/monapi/products/test` - Test de connexion
- `GET http://localhost:3000/monapi/products` - Liste tous les produits
- `GET http://localhost:3000/monapi/products/:id` - Récupère un produit
- `POST http://localhost:3000/monapi/products` - Crée un produit
- `PUT http://localhost:3000/monapi/products/:id` - Met à jour un produit
- `DELETE http://localhost:3000/monapi/products/:id` - Supprime un produit

**Books** :
- `GET http://localhost:3000/monapi/books` - Liste tous les livres
- `GET http://localhost:3000/monapi/books/:id` - Récupère un livre
- `POST http://localhost:3000/monapi/books` - Crée un livre
- `PUT http://localhost:3000/monapi/books/:id` - Met à jour un livre
- `DELETE http://localhost:3000/monapi/books/:id` - Supprime un livre
- `POST http://localhost:3000/monapi/books/:id/cover` - Upload une couverture

---

## 13. Bonnes pratiques et conventions

### 13.1 Structure des réponses JSON

Toutes les réponses suivent ce format :

```javascript
{
    "success": true/false,
    "message": "message descriptif",
    "data": {} // ou null en cas d'erreur
}
```

### 13.2 Codes de statut HTTP

- `200` : Succès (GET, PUT)
- `201` : Créé (POST)
- `204` : Pas de contenu (DELETE)
- `400` : Requête invalide (validation échouée)
- `404` : Ressource non trouvée
- `500` : Erreur serveur

### 13.3 Gestion des erreurs

Toujours utiliser `try/catch` dans les contrôleurs et retourner des réponses JSON cohérentes.

### 13.4 Validation des données

- Toujours valider les données d'entrée
- Utiliser des fonctions de validation réutilisables
- Retourner des messages d'erreur clairs

### 13.5 Relations Sequelize

- Définir les associations dans la méthode `associate` des modèles
- Utiliser `include` pour charger les relations dans les requêtes
- Utiliser des alias (`as`) pour clarifier les relations

---

## 14. Commandes utiles

### 14.1 Base de données

```bash
# Créer la base de données
npx sequelize-cli db:create

# Exécuter les migrations
npx sequelize-cli db:migrate

# Annuler la dernière migration
npx sequelize-cli db:migrate:undo

# Exécuter les seeders
npx sequelize-cli db:seed:all

# Annuler les seeders
npx sequelize-cli db:seed:undo:all
```

### 14.2 Génération de fichiers

```bash
# Générer une migration
npx sequelize-cli migration:generate --name nom-de-la-migration

# Générer un modèle (optionnel, créer manuellement recommandé)
npx sequelize-cli model:generate --name NomModel --attributes attribut:type
```

### 14.3 Développement

```bash
# Démarrer en mode développement
npm run dev

# Démarrer en mode production
npm start
```

---

## 15. Résumé des étapes

1. ✅ Installation des dépendances
2. ✅ Configuration de l'environnement (.env)
3. ✅ Configuration de Sequelize CLI (.sequelizerc)
4. ✅ Configuration de la base de données (config.js)
5. ✅ Création des modèles (Product, Book, Type)
6. ✅ Création des migrations
7. ✅ Exécution des migrations
8. ✅ Création des contrôleurs
9. ✅ Création des routes
10. ✅ Création des middlewares
11. ✅ Création des validations
12. ✅ Configuration de l'application Express
13. ✅ Test de l'application

---

## 16. Points importants à retenir

1. **Migrations vs Modèles** : Les migrations créent la structure en base de données, les modèles définissent les champs que Sequelize peut utiliser. Les deux doivent être synchronisés.

2. **Sequelize dans les migrations** : Utilisez toujours le paramètre `Sequelize` (majuscule) passé à la fonction, pas une instance importée.

3. **Associations** : Définissez-les dans la méthode `associate` des modèles, puis utilisez `include` dans les requêtes.

4. **Validation** : Validez toujours les données d'entrée avant de les sauvegarder.

5. **Gestion des erreurs** : Utilisez toujours `try/catch` et retournez des réponses JSON cohérentes.

6. **Upload de fichiers** : N'oubliez pas de créer le dossier `uploads/` et de configurer le middleware multer.

---

**Fin du cours**

