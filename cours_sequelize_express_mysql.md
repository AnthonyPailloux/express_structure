# 🧠 Cours : Installation et configuration complète de Sequelize avec Express et MySQL

## 🌟 Objectif  
Mettre en place un projet **Express** avec une base de données **MySQL** gérée par **Sequelize ORM**, depuis **Cmder** sous **Laragon**, avec gestion des migrations, undo, et intégration complète.

---

## ⚙️ 1. Vérifier les prérequis

Avant tout, assure-toi que ton environnement est prêt :

```bash
node -v
npm -v
```

Tu dois avoir **Node.js** et **npm** installés.  
Sous **Laragon**, **MySQL** est déjà disponible (souvent sur le port `3306`).

---

## 🗂️ 2. Se placer dans le bon dossier

Depuis Cmder :

```bash
cd C:\laragon\www
cd express
cd express_structure
```

Tu arrives dans ton dossier de projet **express_structure**.

---

## 🧬 3. Ouvrir le projet dans VS Code

Pour ouvrir directement le dossier dans VS Code :

```bash
code .
```

Cela permet d'éditer ton projet plus facilement.

---

## 📦 4. Initialiser le projet et installer les dépendances de base

### 4.1. Initialiser le projet (si ce n'est pas déjà fait)

```bash
npm init -y
```

### 4.2. Installer Express et les dépendances de base

```bash
npm install express cors morgan dotenv
```

- **express** : framework web pour Node.js
- **cors** : permet les requêtes cross-origin (React → Express)
- **morgan** : middleware de logging des requêtes HTTP
- **dotenv** : charge les variables d'environnement depuis un fichier `.env`

### 4.3. Installer les outils de développement

```bash
npm install --save-dev nodemon
```

- **nodemon** : redémarre automatiquement le serveur lors des modifications

---

## 🖽️ 5. Installer Sequelize et le driver MySQL

```bash
npm install sequelize mysql2
```

- **sequelize** : le framework ORM (*Object-Relational Mapping*)
- **mysql2** : le driver qui permet à Sequelize de parler à MySQL

---

## 🧮 6. Installer l'outil CLI de Sequelize

Le **CLI** (*Command Line Interface*) permet de créer automatiquement la structure des dossiers Sequelize :

```bash
npm install --save-dev sequelize-cli
```

L'option `--save-dev` indique que c'est un outil pour le développement.

---

## 📁 7. Organiser la structure du projet

### 7.1. Créer le dossier `src/`

Pour une meilleure organisation, crée le dossier `src/` qui contiendra tout ton code :

```bash
mkdir src
```

### 7.2. Créer le fichier `.gitignore`

Si tu n'as pas de `.gitignore`, crée-le à la racine du projet :

```gitignore
node_modules/
.env
.DS_Store
*.log
```

> ⚠️ **Important** : Le fichier `.env` ne doit **jamais** être commité dans Git.

### 7.3. ⚠️ IMPORTANT : Configurer Sequelize CLI AVANT l'initialisation

**Crée le fichier `.sequelizerc` à la racine du projet AVANT d'exécuter `npx sequelize-cli init`** :

```javascript
const path = require('path');

module.exports = {
  'config': path.resolve('src', 'config', 'config.json'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('src', 'seeders'),
  'migrations-path': path.resolve('src', 'migrations')
};
```

> 🔑 **Pourquoi avant ?** : Si tu créés `.sequelizerc` après l'initialisation, Sequelize CLI aura déjà créé les dossiers à la racine. En le créant avant, les dossiers seront créés directement dans `src/`.  
> 📝 **Note** : On pointe vers `config.json` car c'est ce que Sequelize CLI crée par défaut. On le convertira en `config.js` à l'étape 9.2.

---

## 🎗️ 8. Initialiser Sequelize

Maintenant que `.sequelizerc` est créé, initialise Sequelize :

```bash
npx sequelize-cli init
```

Cela va générer les dossiers suivants **directement dans `src/`** (grâce au `.sequelizerc`) :

```
src/
├─ config/
│   └─ config.json  (on le convertira en config.js à l'étape 9.2)
├─ migrations/
├─ models/
│   └─ index.js
└─ seeders/
```

### 🗁️ Structure obtenue :

```
project/
├─ src/
│   ├─ config/
│   │   └─ config.json  (sera converti en config.js)
│   ├─ migrations/
│   ├─ models/
│   │   └─ index.js
│   └─ seeders/
├─ .sequelizerc
├─ .gitignore
└─ package.json
```

> ✅ **Résultat** : Les dossiers sont créés directement dans `src/`, pas besoin de les déplacer après !  
> 📝 **Note** : Sequelize CLI crée `config.json` par défaut. On le convertira en `config.js` à l'étape 9.2 pour utiliser les variables d'environnement.

---

## ⚙️ 9. Configurer la connexion MySQL avec .env

### 9.1. Créer le fichier `.env`

Crée un fichier `.env` à la racine du projet :

```env
# Variables d'environnement pour la base de données
DB_USER=root
DB_PASS=
DB_NAME=express_structure
DB_HOST=127.0.0.1
DB_PORT=3306

# Port du serveur Express
PORT=3000

# Environnement
NODE_ENV=development
```

> ⚠️ **Important** : Le fichier `.env` est déjà dans `.gitignore` créé à l'étape 7.2.

### 9.2. Convertir `config.json` en `config.js`

Sequelize CLI a créé un fichier `src/config/config.json`, mais nous voulons utiliser `config.js` pour pouvoir charger les variables d'environnement avec `dotenv`.

**Étapes à suivre :**

1. **Supprime le fichier `src/config/config.json`**
2. **Crée un nouveau fichier `src/config/config.js`** avec le contenu suivant :

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
      underscored: true  // Utilise snake_case pour les noms de colonnes
    }
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME + '_test',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
  }
};
```

3. **Mets à jour le fichier `.sequelizerc`** pour pointer vers `config.js` au lieu de `config.json` :

```javascript
const path = require('path');

module.exports = {
  'config': path.resolve('src', 'config', 'config.js'),  // Changé de config.json à config.js
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('src', 'seeders'),
  'migrations-path': path.resolve('src', 'migrations')
};
```

> 💡 **Avantages de cette configuration** :
> - Utilise des variables d'environnement (sécurité)
> - Pas de mots de passe en dur dans le code
> - Facile à adapter pour différents environnements
> - Compatible avec `.sequelizerc` qui pointe maintenant vers `config.js`

> ✅ **Résultat** : Tu as maintenant `config.js` qui charge les variables d'environnement depuis `.env`, et `.sequelizerc` pointe correctement vers `config.js`.

---

## 🗄️ 10. Créer la base de données depuis le terminal

### 10.1. Ajouter les scripts npm dans `package.json`

Ajoute ces scripts dans ton `package.json` :

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "db:create": "sequelize db:create",
    "db:migrate": "sequelize db:migrate",
    "db:migrate:undo": "sequelize db:migrate:undo",
    "db:migrate:status": "sequelize db:migrate:status",
    "db:seed": "sequelize db:seed:all",
    "db:seed:undo": "sequelize db:seed:undo:all"
  }
}
```

### 10.2. Créer la base de données

Tu peux créer ta base MySQL directement avec Sequelize CLI :

```bash
npm run db:create
```

**Ou directement** :
```bash
npx sequelize-cli db:create
```

Cela crée la base **express_structure** dans MySQL (selon `DB_NAME` dans `.env`).

> 💡 **Si tu as une erreur "Dialect undefined"** : Vérifie que ton fichier `config.js` contient bien `dialect: 'mysql'` et que le fichier `.sequelizerc` pointe vers le bon chemin.

---

## 🧱 11. Créer une migration

Il existe deux méthodes pour créer une migration :

### Méthode 1 : Créer une migration manuellement

Pour créer une migration sans modèle associé :

```bash
npx sequelize-cli migration:generate --name create-health-checks
```

**Résultat** : Un fichier est créé dans `src/migrations/` avec un nom comme :
- `20251110104402-create-health-checks.js`

### Méthode 2 : Créer un modèle avec sa migration

Pour créer un modèle **Product** avec sa migration automatique :

```bash
npx sequelize-cli model:generate --name Product --attributes name:string,price:float
```

Cela crée :
- Un fichier dans `src/models/product.js`
- Une migration dans `src/migrations/xxxx-create-product.js`

---

## 📝 12. Écrire une migration complète

### 12.1. Structure d'une migration

Ouvre le fichier de migration créé. Tu auras une structure comme ceci :

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // La fonction up() contient les modifications à APPLIQUER
    // Elle sera exécutée quand on fait : npm run db:migrate
    
    // Exemple : Création de la table 'health_check'
    await queryInterface.createTable('health_check', {
      // Colonne id : entier, auto-incrémenté, clé primaire
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      // Colonne createAt : date, obligatoire, valeur par défaut = maintenant
      createAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    // La fonction down() permet d'ANNULER les modifications faites dans up()
    // Elle sera exécutée quand on fait : npm run db:migrate:undo
    
    // Exemple : Suppression de la table 'health_check'
    await queryInterface.dropTable('health_check');
  }
};
```

### 12.2. Types de données Sequelize courants

| Type Sequelize | Type MySQL | Description |
|----------------|------------|-------------|
| `Sequelize.STRING` | VARCHAR(255) | Chaîne de caractères |
| `Sequelize.TEXT` | TEXT | Texte long |
| `Sequelize.INTEGER` | INT | Nombre entier |
| `Sequelize.FLOAT` | FLOAT | Nombre décimal |
| `Sequelize.DECIMAL(10, 2)` | DECIMAL(10, 2) | Nombre décimal précis |
| `Sequelize.BOOLEAN` | TINYINT(1) | Booléen |
| `Sequelize.DATE` | DATETIME | Date et heure |
| `Sequelize.DATEONLY` | DATE | Date uniquement |

### 12.3. Options courantes des colonnes

```javascript
{
  type: Sequelize.STRING,
  allowNull: false,           // La colonne est obligatoire
  defaultValue: 'valeur',     // Valeur par défaut
  primaryKey: true,           // Clé primaire
  autoIncrement: true,        // Auto-incrémentation
  unique: true,               // Valeur unique
  validate: {
    isEmail: true             // Validation (ex: email)
  }
}
```

---

## 🚀 13. Exécuter les migrations

### 13.1. Appliquer les migrations

Pour appliquer toutes les migrations en attente :

```bash
npm run db:migrate
```

**Ou directement** :
```bash
npx sequelize-cli db:migrate
```

**Ce qui se passe** :
1. Sequelize vérifie quelles migrations ont déjà été exécutées (table `SequelizeMeta`)
2. Il exécute uniquement les migrations **non encore appliquées**
3. Il appelle la fonction `up()` de chaque nouvelle migration
4. Il enregistre le nom de la migration dans la table `SequelizeMeta`

**Exemple de sortie** :
```
== 20251110104402-create-health-checks: migrating =======
== 20251110104402-create-health-checks: migrated (0.038s)
```

### 13.2. Vérifier l'état des migrations

Pour voir quelles migrations ont été exécutées :

```bash
npm run db:migrate:status
```

**Ou directement** :
```bash
npx sequelize-cli db:migrate:status
```

**Résultat** :
```
up   20251110104402-create-health-checks.js
down 20251110105000-create-products.js
```

- `up` = migration exécutée ✅
- `down` = migration non exécutée ❌

---

## ⏪ 14. Annuler une migration (Undo)

### 14.1. Annuler la dernière migration

Pour annuler la **dernière migration** exécutée :

```bash
npm run db:migrate:undo
```

**Ou directement** :
```bash
npx sequelize-cli db:migrate:undo
```

**Ce qui se passe** :
1. Sequelize récupère la **dernière migration** exécutée
2. Il appelle la fonction `down()` de cette migration
3. Il supprime l'enregistrement de la migration dans la table `SequelizeMeta`

**Exemple de sortie** :
```
== 20251110104402-create-health-checks: reverting =======
== 20251110104402-create-health-checks: reverted (0.025s)
```

### 14.2. Annuler toutes les migrations

Pour annuler **toutes** les migrations en une fois :

```bash
npx sequelize-cli db:migrate:undo:all
```

> ⚠️ **Attention** : Cette commande annule **toutes** les migrations, pas seulement la dernière !

### 14.3. ⚠️ Important : Compléter la fonction `down()`

Si la fonction `down()` est **vide**, l'undo ne fera rien et tu auras une erreur ou un avertissement.

**❌ Exemple incorrect** :
```javascript
async down (queryInterface, Sequelize) {
  // Vide ! L'undo ne fonctionnera pas correctement
}
```

**✅ Exemple correct** :
```javascript
async down (queryInterface, Sequelize) {
  // Supprime la table créée dans up()
  await queryInterface.dropTable('health_check');
}
```

### 14.4. Règle d'or pour les migrations

> 🔑 **Règle d'or** : La fonction `down()` doit toujours faire **l'inverse exact** de ce que fait `up()`.
> - Si `up()` crée une table → `down()` doit la supprimer
> - Si `up()` ajoute une colonne → `down()` doit la retirer
> - Si `up()` modifie une colonne → `down()` doit la restaurer

> 📚 **Pour plus de détails sur les migrations et l'undo**, consulte le cours dédié : `cours_migrations_sequelize_undo.md`

---

## 🧪 15. Créer et utiliser des seeders (Données de test)

### 15.1. Créer un seeder

Pour créer un fichier de seeder :

```bash
npx sequelize-cli seed:generate --name demo-products
```

**Résultat** : Un fichier est créé dans `src/seeders/` avec un nom comme :
- `20251110105000-demo-products.js`

### 15.2. Écrire un seeder

Ouvre le fichier de seeder et complète-le :

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // La fonction up() insère les données
    await queryInterface.bulkInsert('products', [
      {
        name: 'Stylo',
        price: 2.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Feutre',
        price: 3.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cahier',
        price: 4.00,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // La fonction down() supprime les données
    await queryInterface.bulkDelete('products', null, {});
  }
};
```

### 15.3. Exécuter les seeders

Pour insérer les données de test :

```bash
npm run db:seed
```

**Ou directement** :
```bash
npx sequelize-cli db:seed:all
```

### 15.4. Annuler les seeders

Pour supprimer les données insérées :

```bash
npm run db:seed:undo
```

**Ou directement** :
```bash
npx sequelize-cli db:seed:undo:all
```

---

## 🧬 16. Utiliser les modèles dans Express

### 16.1. Structure du fichier `src/models/index.js`

Ce fichier charge automatiquement tous les modèles du dossier `models/`. Il est généré par Sequelize CLI et ne doit généralement pas être modifié.

### 16.2. Créer un contrôleur avec Sequelize

Exemple : `src/controller/products.controller.js`

```javascript
// Import du modèle Product
const { Product } = require('../models');

// Lister tous les produits
exports.listProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json({
      success: true,
      message: 'Liste des produits',
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits',
      error: error.message
    });
  }
};

// Récupérer un produit par son ID
exports.getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
        data: null
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Produit trouvé',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit',
      error: error.message
    });
  }
};

// Créer un produit
exports.createProduct = async (req, res) => {
  try {
    const { name, price } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'name et price sont obligatoires',
        data: null
      });
    }
    
    const newProduct = await Product.create({
      name,
      price: parseFloat(price)
    });
    
    res.status(201).json({
      success: true,
      message: 'Produit créé',
      data: newProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du produit',
      error: error.message
    });
  }
};

// Mettre à jour un produit
exports.updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, price } = req.body;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
        data: null
      });
    }
    
    await product.update({
      name: name || product.name,
      price: price ? parseFloat(price) : product.price
    });
    
    res.status(200).json({
      success: true,
      message: 'Produit mis à jour',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du produit',
      error: error.message
    });
  }
};

// Supprimer un produit
exports.deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
        data: null
      });
    }
    
    await product.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Produit supprimé',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du produit',
      error: error.message
    });
  }
};
```

### 16.3. Créer les routes

Exemple : `src/routes/products.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const productsController = require('../controller/products.controller');

// GET /monapi/products - Lister tous les produits
router.get('/products', productsController.listProducts);

// GET /monapi/products/:id - Récupérer un produit par son ID
router.get('/products/:id', productsController.getProductById);

// POST /monapi/products - Créer un produit
router.post('/products', productsController.createProduct);

// PUT /monapi/products/:id - Mettre à jour un produit
router.put('/products/:id', productsController.updateProduct);

// DELETE /monapi/products/:id - Supprimer un produit
router.delete('/products/:id', productsController.deleteProduct);

module.exports = router;
```

### 16.4. Intégrer les routes dans l'application

Exemple : `src/routes/index.js`

```javascript
const express = require('express');
const router = express.Router();
const productsRoutes = require('./products.routes');

// Utilise les routes des produits
router.use('/', productsRoutes);

module.exports = router;
```

### 16.5. Méthodes Sequelize courantes

| Méthode | Description | Exemple |
|---------|-------------|---------|
| `findAll()` | Récupérer tous les enregistrements | `Product.findAll()` |
| `findByPk(id)` | Récupérer par clé primaire | `Product.findByPk(1)` |
| `findOne()` | Récupérer un enregistrement | `Product.findOne({ where: { name: 'Stylo' } })` |
| `create()` | Créer un enregistrement | `Product.create({ name: 'Stylo', price: 2 })` |
| `update()` | Mettre à jour un enregistrement | `product.update({ price: 3 })` |
| `destroy()` | Supprimer un enregistrement | `product.destroy()` |

---

## 🔧 17. Configuration de l'application Express

### 17.1. Fichier `src/app.js`

```javascript
// Import des packages
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const router = require('./routes');
const notFound = require('./middlewares/notFound');

// Créer l'application Express
const app = express();

// Middleware CORS : autoriser les requêtes cross-origin (ex: React → Express)
app.use(cors());

// Parser le contenu du body de la requête (JSON)
app.use(express.json());

// Middleware de log : affiche les requêtes HTTP dans la console
app.use(morgan('dev'));

// Utiliser toutes les routes (sous la route /monapi)
app.use('/monapi', router);

// Middleware de gestion des routes non trouvées
app.use(notFound);

// Export de l'application
module.exports = app;
```

### 17.2. Fichier `src/server.js`

```javascript
// Charger les variables d'environnement depuis .env
require('dotenv').config();

// Import de l'application Express
const app = require('./app');

// Récupérer le PORT depuis les variables d'environnement
const PORT = process.env.PORT || 3000;

// Vérifier que le PORT existe
if (!PORT) {
  console.log('PORT absent, veuillez compléter le fichier .env');
  process.exit(1);
}

// Démarrer le serveur Express
app.listen(PORT, () => {
  console.log(`Server lancé sur le port ${PORT}`);
});
```

### 17.3. Middleware de gestion des erreurs 404

Exemple : `src/middlewares/notFound.js`

```javascript
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl
  });
};

module.exports = notFound;
```

---

## 🧹 18. Réinitialiser la base de données (Optionnel)

Si tu veux tout effacer et recommencer :

### 18.1. Supprimer la base de données

```bash
npx sequelize-cli db:drop
```

### 18.2. Recréer la base de données

```bash
npm run db:create
```

### 18.3. Réexécuter les migrations

```bash
npm run db:migrate
```

### 18.4. Réinsérer les données de test

```bash
npm run db:seed
```

---

## 🧠 19. Lexique rapide

| Terme | Définition |
|-------|-------------|
| **ORM** | Outil qui fait le lien entre ton code et la base SQL sans écrire directement des requêtes |
| **Migration** | Fichier qui décrit comment créer/modifier une table |
| **Seeder** | Sert à insérer des données de test automatiquement |
| **Model** | Représente une table dans le code JavaScript |
| **CLI** | Interface en ligne de commande |
| **QueryInterface** | Interface Sequelize pour exécuter des opérations sur la base de données |
| **up()** | Fonction qui applique une migration |
| **down()** | Fonction qui annule une migration |

---

## ✅ 20. Résumé des commandes principales

| Action | Commande | Description |
|--------|----------|-------------|
| **Initialiser Sequelize** | `npx sequelize-cli init` | Crée la structure de dossiers |
| **Créer une base de données** | `npm run db:create` | Crée la base MySQL |
| **Créer une migration** | `npx sequelize-cli migration:generate --name nom-migration` | Crée un fichier de migration |
| **Créer un modèle** | `npx sequelize-cli model:generate --name Nom --attributes cle:type` | Crée un modèle et sa migration |
| **Exécuter les migrations** | `npm run db:migrate` | Applique toutes les migrations en attente |
| **Annuler la dernière migration** | `npm run db:migrate:undo` | Annule la dernière migration |
| **Vérifier l'état des migrations** | `npm run db:migrate:status` | Affiche quelles migrations sont appliquées |
| **Créer un seeder** | `npx sequelize-cli seed:generate --name nom-seeder` | Crée un fichier de seeder |
| **Exécuter les seeders** | `npm run db:seed` | Insère les données de test |
| **Annuler les seeders** | `npm run db:seed:undo` | Supprime les données de test |
| **Démarrer le serveur** | `npm run dev` | Démarre le serveur avec nodemon |

---

## 🐛 21. Résolution de problèmes courants

### Problème 1 : "Dialect undefined"

**Erreur** : `ERROR: Dialect undefined does not support db:create / db:drop commands`

**Solution** :
1. Vérifie que ton fichier `src/config/config.js` contient bien `dialect: 'mysql'`
2. Vérifie que le fichier `.sequelizerc` pointe vers le bon chemin
3. Vérifie que les variables d'environnement dans `.env` sont correctes

### Problème 2 : "Cannot find module"

**Erreur** : `Cannot find module '../models'`

**Solution** :
1. Vérifie que le modèle existe dans `src/models/`
2. Vérifie que le modèle est correctement exporté
3. Vérifie les chemins relatifs dans tes imports

### Problème 3 : "Table doesn't exist"

**Erreur** : `Table 'express_structure.products' doesn't exist`

**Solution** :
1. Vérifie que les migrations ont été exécutées : `npm run db:migrate:status`
2. Exécute les migrations : `npm run db:migrate`
3. Vérifie que le nom de la table dans le modèle correspond à celui de la base

### Problème 4 : Port déjà utilisé

**Erreur** : `Error: listen EADDRINUSE: address already in use :::3000`

**Solution** :
1. Change le PORT dans `.env`
2. Ou arrête le processus qui utilise le port 3000

---

## 🎯 22. Checklist de vérification

Avant de considérer ton projet comme prêt, vérifie :

- [ ] Le fichier `.env` est créé et configuré
- [ ] Le fichier `.gitignore` contient `.env`
- [ ] Le fichier `.sequelizerc` est créé et configuré
- [ ] Le fichier `src/config/config.js` utilise les variables d'environnement
- [ ] La base de données est créée
- [ ] Les migrations sont créées et complétées (avec `up()` et `down()`)
- [ ] Les migrations sont exécutées
- [ ] Les modèles sont créés et utilisables
- [ ] Les contrôleurs utilisent les modèles Sequelize
- [ ] Les routes sont configurées
- [ ] Le serveur démarre sans erreur
- [ ] Les requêtes API fonctionnent (testées avec Postman ou Insomnia)

---

## 📚 23. Ressources supplémentaires

- **Cours détaillé sur les migrations et l'undo** : `cours_migrations_sequelize_undo.md`
- [Documentation officielle Sequelize](https://sequelize.org/docs/v6/)
- [Documentation Sequelize CLI](https://github.com/sequelize/cli)
- [Documentation Express](https://expressjs.com/)

---

## 🧬 24. Étape suivante

Tu peux maintenant :
- ✅ Créer tes **contrôleurs Express** pour manipuler les données (**CRUD complet**)
- ✅ Ajouter des **routes** (ex: `/monapi/products`)
- ✅ Tester avec **Postman** ou **Insomnia**
- ✅ Créer une **application React** qui consomme ton API
- ✅ Ajouter de la **validation** des données
- ✅ Implémenter l'**authentification** et l'**autorisation**
- ✅ Ajouter des **relations** entre les modèles (associations Sequelize)

---

## 🎓 Conclusion

Tu as maintenant une structure complète pour développer une application Express avec Sequelize et MySQL. Les migrations te permettent de versionner l'évolution de ta base de données, et l'undo te permet de revenir en arrière si nécessaire.

**Points clés à retenir** :
- ✅ Utilise les variables d'environnement pour la configuration
- ✅ Complète toujours les fonctions `up()` et `down()` dans tes migrations
- ✅ Teste toujours l'undo après avoir créé une migration
- ✅ Utilise les modèles Sequelize dans tes contrôleurs
- ✅ Gère les erreurs dans tes contrôleurs

**Bon courage avec ton projet ! 🚀**
