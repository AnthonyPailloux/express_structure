# Cours : Authentification avec JWT, bcrypt et express-validator

## Table des matières

1. [Installation des dépendances](#1-installation-des-dépendances)
2. [Configuration de l'environnement](#2-configuration-de-lenvironnement)
3. [Migration : Table User](#3-migration--table-user)
4. [Modèle User](#4-modèle-user)
5. [Validation avec express-validator](#5-validation-avec-express-validator)
6. [Contrôleur d'authentification](#6-contrôleur-dauthentification)
7. [Middleware d'authentification JWT](#7-middleware-dauthentification-jwt)
8. [Routes d'authentification](#8-routes-dauthentification)
9. [Protection des routes existantes](#9-protection-des-routes-existantes)
10. [Test de l'authentification](#10-test-de-lauthentification)

---

## 1. Installation des dépendances

### 1.1 Installation des packages nécessaires

```bash
npm install bcrypt jsonwebtoken express-validator
```

**Explication des packages** :
- **bcrypt** : Pour hasher les mots de passe de manière sécurisée
- **jsonwebtoken** : Pour générer et vérifier les tokens JWT
- **express-validator** : Pour valider les données d'entrée (alternative à la validation manuelle)

### 1.2 Vérification de l'installation

Vérifiez que les packages sont bien installés dans `package.json` :

```json
{
  "dependencies": {
    "bcrypt": "^5.x.x",
    "jsonwebtoken": "^9.x.x",
    "express-validator": "^7.x.x"
  }
}
```

---

## 2. Configuration de l'environnement

### 2.1 Ajout de la clé secrète JWT

Ajoutez la variable d'environnement `JWT_SECRET` dans votre fichier `.env` :

```env
PORT=3000
NODE_ENV=development

# Configuration base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=express_structure_db

# Configuration JWT
JWT_SECRET=votre_cle_secrete_tres_longue_et_aleatoire_ici
JWT_EXPIRES_IN=24h
```

**Important** :
- `JWT_SECRET` : Utilisez une chaîne longue et aléatoire (minimum 32 caractères)
- `JWT_EXPIRES_IN` : Durée de validité du token (ex: `24h`, `7d`, `30d`)

### 2.2 Génération d'une clé secrète sécurisée

Vous pouvez générer une clé secrète avec Node.js :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiez le résultat dans votre fichier `.env` comme valeur de `JWT_SECRET`.

---

## 3. Migration : Table User

### 3.1 Génération de la migration

```bash
npx sequelize-cli migration:generate --name create-user
```

### 3.2 Structure de la migration

Créez `src/migrations/YYYYMMDDHHMMSS-create-user.js` :

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user'
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
    
    // Création d'un index sur l'email pour améliorer les performances
    await queryInterface.addIndex('user', ['email'], {
      unique: true,
      name: 'user_email_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user');
  }
};
```

### 3.3 Exécution de la migration

```bash
npx sequelize-cli db:migrate
```

---

## 4. Modèle User

### 4.1 Création du modèle User

Créez `src/models/User.js` :

```javascript
'use strict';

const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            // Définir des relations ici si nécessaire
            // Exemple : User.hasMany(models.Book, { foreignKey: 'user_id' });
        }
        
        // Méthode pour comparer le mot de passe
        async comparePassword(password) {
            return await bcrypt.compare(password, this.password);
        }
        
        // Méthode pour exclure le mot de passe lors de la sérialisation
        toJSON() {
            const values = { ...this.get() };
            delete values.password;
            return values;
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                    notEmpty: true
                }
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [6, 255] // Minimum 6 caractères
                }
            },
            first_name: {
                type: DataTypes.STRING(100),
                allowNull: true,
                validate: {
                    len: [0, 100]
                }
            },
            last_name: {
                type: DataTypes.STRING(100),
                allowNull: true,
                validate: {
                    len: [0, 100]
                }
            },
            role: {
                type: DataTypes.ENUM('user', 'admin'),
                allowNull: false,
                defaultValue: 'user'
            }
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'user',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            hooks: {
                // Hook avant la création : hash le mot de passe
                beforeCreate: async (user) => {
                    if (user.password) {
                        const salt = await bcrypt.genSalt(10);
                        user.password = await bcrypt.hash(user.password, salt);
                    }
                },
                // Hook avant la mise à jour : hash le mot de passe si modifié
                beforeUpdate: async (user) => {
                    if (user.changed('password')) {
                        const salt = await bcrypt.genSalt(10);
                        user.password = await bcrypt.hash(user.password, salt);
                    }
                }
            }
        }
    );
    
    return User;
};
```

### 4.2 Explication des hooks

- **beforeCreate** : Hash automatiquement le mot de passe avant la création
- **beforeUpdate** : Hash le mot de passe seulement s'il a été modifié
- **comparePassword** : Méthode utilitaire pour comparer un mot de passe en clair avec le hash
- **toJSON** : Exclut automatiquement le mot de passe lors de la sérialisation JSON

---

## 5. Validation avec express-validator

### 5.1 Création du fichier de validation

Créez `src/utils/authValidation.js` :

```javascript
const { body, validationResult } = require('express-validator');

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Erreurs de validation',
            data: errors.array()
        });
    }
    next();
};

// Règles de validation pour l'inscription
const validateRegister = [
    body('email')
        .isEmail()
        .withMessage('L\'email doit être valide')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
        .optional({ nullable: true }),
    body('first_name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Le prénom doit contenir entre 1 et 100 caractères'),
    body('last_name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Le nom doit contenir entre 1 et 100 caractères'),
    handleValidationErrors
];

// Règles de validation pour la connexion
const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('L\'email doit être valide')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Le mot de passe est requis'),
    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    handleValidationErrors
};
```

### 5.2 Explication des validations

- **email** : Vérifie que c'est un email valide et le normalise
- **password** : 
  - Minimum 6 caractères
  - Contient au moins une majuscule, une minuscule et un chiffre (optionnel mais recommandé)
- **first_name / last_name** : Optionnels, mais s'ils sont présents, doivent respecter les limites de longueur

---

## 6. Contrôleur d'authentification

### 6.1 Création du contrôleur

Créez `src/controllers/auth.controller.js` :

```javascript
const db = require('../models');
const User = db.User;
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Fonction pour générer un token JWT
const generateToken = (userId, email, role) => {
    return jwt.sign(
        {
            userId,
            email,
            role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
    );
};

// Inscription d'un nouvel utilisateur
exports.register = async (req, res) => {
    try {
        const { email, password, first_name, last_name } = req.body;
        
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ where: { email } });
        
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Cet email est déjà utilisé',
                data: null
            });
        }
        
        // Créer le nouvel utilisateur
        const newUser = await User.create({
            email,
            password, // Le hook beforeCreate va hasher le mot de passe
            first_name: first_name || null,
            last_name: last_name || null,
            role: 'user'
        });
        
        // Générer le token JWT
        const token = generateToken(newUser.id, newUser.email, newUser.role);
        
        return res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: {
                user: newUser, // Le mot de passe est exclu grâce à toJSON()
                token
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne lors de l\'inscription',
            data: null
        });
    }
};

// Connexion d'un utilisateur
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Trouver l'utilisateur par email
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect',
                data: null
            });
        }
        
        // Vérifier le mot de passe
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect',
                data: null
            });
        }
        
        // Générer le token JWT
        const token = generateToken(user.id, user.email, user.role);
        
        return res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            data: {
                user, // Le mot de passe est exclu grâce à toJSON()
                token
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne lors de la connexion',
            data: null
        });
    }
};

// Récupérer le profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
    try {
        // req.user est défini par le middleware authenticateToken
        const user = await User.findByPk(req.user.userId, {
            attributes: { exclude: ['password'] }
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé',
                data: null
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Profil récupéré avec succès',
            data: user
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du profil', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne lors de la récupération du profil',
            data: null
        });
    }
};
```

---

## 7. Middleware d'authentification JWT

### 7.1 Création du middleware

Créez `src/middlewares/authenticateToken.js` :

```javascript
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token d\'authentification manquant',
            data: null
        });
    }
    
    // Vérifier le token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token invalide ou expiré',
                data: null
            });
        }
        
        // Ajouter les informations de l'utilisateur à la requête
        req.user = decoded;
        next();
    });
};

// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé. Droits administrateur requis.',
            data: null
        });
    }
};

module.exports = {
    authenticateToken,
    isAdmin
};
```

### 7.2 Explication du middleware

- **authenticateToken** : 
  - Vérifie la présence du token dans le header `Authorization`
  - Vérifie la validité du token
  - Ajoute les informations de l'utilisateur à `req.user`
  
- **isAdmin** : 
  - Vérifie que l'utilisateur a le rôle `admin`
  - Doit être utilisé après `authenticateToken`

---

## 8. Routes d'authentification

### 8.1 Création des routes

Créez `src/routes/auth.routes.js` :

```javascript
const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../utils/authValidation');
const { authenticateToken } = require('../middlewares/authenticateToken');

const router = Router();

// Route d'inscription (publique)
router.post('/register', validateRegister, authController.register);

// Route de connexion (publique)
router.post('/login', validateLogin, authController.login);

// Route pour récupérer le profil (protégée)
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
```

### 8.2 Ajout des routes dans le routeur principal

Modifiez `src/routes/index.js` :

```javascript
// Extrait router de express
const { Router } = require('express');

// Crée le routeur
const router = Router();

// Montage des sous-routes
router.use('/auth', require('./auth.routes')); // Routes d'authentification
router.use('/products', require('./products.routes'));
router.use('/books', require('./books.routes'));

// Exporte le routeur
module.exports = router;
```

---

## 9. Protection des routes existantes

### 9.1 Protection des routes Products

Modifiez `src/routes/products.routes.js` :

```javascript
const { Router } = require('express');
const productsController = require('../controllers/products.controller');
const { authenticateToken } = require('../middlewares/authenticateToken');

const router = Router();

// Route de test (publique)
router.get('/test', productsController.test);

// Routes protégées (nécessitent une authentification)
router.get('/', authenticateToken, productsController.listProducts);
router.get('/:id', authenticateToken, productsController.getProductById);
router.post('/', authenticateToken, productsController.createProduct);
router.put('/:id', authenticateToken, productsController.updateProduct);
router.delete('/:id', authenticateToken, productsController.deleteProduct);

module.exports = router;
```

### 9.2 Protection des routes Books

Modifiez `src/routes/books.routes.js` :

```javascript
const { Router } = require('express');
const booksController = require('../controllers/books.controller');
const uploadBookImage = require('../middlewares/uploadBookImage');
const { authenticateToken } = require('../middlewares/authenticateToken');

const router = Router();

// Routes protégées (nécessitent une authentification)
router.get('/', authenticateToken, booksController.listBooks);
router.get('/:id', authenticateToken, booksController.getBookById);
router.post('/', authenticateToken, booksController.createdBook);
router.put('/:id', authenticateToken, booksController.updateBook);
router.delete('/:id', authenticateToken, booksController.deleteBook);
// Route spéciale pour l'upload d'image book
router.post('/:id/cover', authenticateToken, uploadBookImage.single('cover'), booksController.uploadCover);

module.exports = router;
```

### 9.3 Protection avec rôle admin (exemple)

Si vous voulez protéger certaines routes pour les admins uniquement :

```javascript
const { authenticateToken, isAdmin } = require('../middlewares/authenticateToken');

// Route accessible uniquement aux admins
router.delete('/admin/:id', authenticateToken, isAdmin, productsController.deleteProduct);
```

---

## 10. Test de l'authentification

### 10.1 Test avec Postman ou cURL

#### 10.1.1 Inscription (Register)

**POST** `http://localhost:3000/monapi/auth/register`

**Headers** :
```
Content-Type: application/json
```

**Body** (JSON) :
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user",
      "created_at": "2024-11-17T10:00:00.000Z",
      "updated_at": "2024-11-17T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 10.1.2 Connexion (Login)

**POST** `http://localhost:3000/monapi/auth/login`

**Headers** :
```
Content-Type: application/json
```

**Body** (JSON) :
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 10.1.3 Récupération du profil (Profile)

**GET** `http://localhost:3000/monapi/auth/profile`

**Headers** :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Profil récupéré avec succès",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user"
  }
}
```

#### 10.1.4 Test d'une route protégée

**GET** `http://localhost:3000/monapi/products`

**Headers** :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Sans token** (erreur attendue) :
```json
{
  "success": false,
  "message": "Token d'authentification manquant",
  "data": null
}
```

### 10.2 Test avec cURL

```bash
# Inscription
curl -X POST http://localhost:3000/monapi/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123","first_name":"John","last_name":"Doe"}'

# Connexion
curl -X POST http://localhost:3000/monapi/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'

# Profil (remplacez TOKEN par le token reçu)
curl -X GET http://localhost:3000/monapi/auth/profile \
  -H "Authorization: Bearer TOKEN"

# Route protégée (remplacez TOKEN par le token reçu)
curl -X GET http://localhost:3000/monapi/products \
  -H "Authorization: Bearer TOKEN"
```

---

## 11. Structure finale des fichiers

```
express_structure/
└── src/
    ├── models/
    │   └── User.js                    # Nouveau
    ├── migrations/
    │   └── YYYYMMDDHHMMSS-create-user.js  # Nouveau
    ├── controllers/
    │   └── auth.controller.js         # Nouveau
    ├── routes/
    │   ├── auth.routes.js             # Nouveau
    │   ├── index.js                   # Modifié
    │   ├── products.routes.js         # Modifié
    │   └── books.routes.js            # Modifié
    ├── middlewares/
    │   └── authenticateToken.js       # Nouveau
    └── utils/
        └── authValidation.js          # Nouveau
```

---

## 12. Commandes récapitulatives

### 12.1 Installation

```bash
npm install bcrypt jsonwebtoken express-validator
```

### 12.2 Migration

```bash
npx sequelize-cli migration:generate --name create-user
npx sequelize-cli db:migrate
```

### 12.3 Démarrage

```bash
npm run dev
```

---

## 13. Points importants à retenir

1. **Sécurité des mots de passe** : 
   - Ne jamais stocker les mots de passe en clair
   - Utiliser bcrypt avec un salt (10 rounds recommandé)
   - Les hooks Sequelize hash automatiquement les mots de passe

2. **Tokens JWT** :
   - Stocker le secret dans `.env`, jamais dans le code
   - Utiliser des tokens avec expiration
   - Vérifier le token sur chaque requête protégée

3. **Validation** :
   - Toujours valider les données d'entrée
   - Utiliser express-validator pour une validation robuste
   - Retourner des messages d'erreur clairs

4. **Headers HTTP** :
   - Le token doit être envoyé dans le header `Authorization: Bearer TOKEN`
   - Le format est important : "Bearer " suivi du token

5. **Gestion des erreurs** :
   - Ne jamais révéler si un email existe ou non (sécurité)
   - Messages d'erreur génériques pour les échecs d'authentification
   - Codes HTTP appropriés (401 pour non authentifié, 403 pour non autorisé)

6. **Exclusion du mot de passe** :
   - Utiliser `toJSON()` dans le modèle pour exclure automatiquement le mot de passe
   - Ou utiliser `attributes: { exclude: ['password'] }` dans les requêtes

---

## 14. Améliorations possibles

### 14.1 Refresh Token

Pour une sécurité accrue, implémentez un système de refresh token :

- Access token : Durée courte (15 minutes)
- Refresh token : Durée longue (7 jours)
- Stocker les refresh tokens en base de données

### 14.2 Limitation des tentatives de connexion

Protection contre les attaques par force brute :

- Limiter le nombre de tentatives de connexion
- Bloquer temporairement après X tentatives échouées

### 14.3 Email de confirmation

- Envoyer un email de confirmation lors de l'inscription
- Activer le compte uniquement après confirmation

### 14.4 Réinitialisation de mot de passe

- Générer un token de réinitialisation
- Envoyer un email avec un lien de réinitialisation
- Permettre la modification du mot de passe

### 14.5 OAuth (Google, Facebook, etc.)

- Intégrer des providers OAuth pour une connexion sociale

---

## 15. Résumé des étapes

1. ✅ Installation des dépendances (bcrypt, jsonwebtoken, express-validator)
2. ✅ Configuration de l'environnement (.env avec JWT_SECRET)
3. ✅ Création de la migration pour la table user
4. ✅ Exécution de la migration
5. ✅ Création du modèle User avec hooks bcrypt
6. ✅ Création des validations avec express-validator
7. ✅ Création du contrôleur d'authentification
8. ✅ Création du middleware d'authentification JWT
9. ✅ Création des routes d'authentification
10. ✅ Protection des routes existantes
11. ✅ Test de l'authentification

---

**Fin du cours d'authentification**

