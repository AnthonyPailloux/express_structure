# 🧠 Cours : Installation et initialisation de Sequelize avec Express et MySQL

## 🌟 Objectif  
Mettre en place un projet **Express** avec une base de données **MySQL** gérée par **Sequelize ORM**, depuis **Cmder** sous **Laragon**.

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
```

Tu arrives dans ton dossier principal **Express**.  
Si tu veux accéder à ton projet existant :

```bash
cd express_structure
```

---

## 🧬 3. Ouvrir le projet dans VS Code

Pour ouvrir directement le dossier dans VS Code :

```bash
code .
```

Cela permet d’éditer ton projet plus facilement.

---

## 📦 4. Installer les dépendances de base

Vérifie que ton projet contient déjà un `package.json`.  
Sinon, initialise-le avec :

```bash
npm init -y
```

Ensuite, installe Express (si ce n’est pas déjà fait) :

```bash
npm install express
```

---

## 🖽️ 5. Installer Sequelize et le driver MySQL

```bash
npm install sequelize mysql2
```

- **sequelize** : le framework ORM (*Object-Relational Mapping*).  
- **mysql2** : le driver qui permet à Sequelize de parler à MySQL.

---

## 🧮 6. Installer l’outil CLI de Sequelize

Le **CLI** (*Command Line Interface*) permet de créer automatiquement la structure des dossiers Sequelize :

```bash
npm install --save-dev sequelize-cli
```

L’option `--save-dev` indique que c’est un outil pour le développement.

---

## 🎗️ 7. Initialiser Sequelize

Crée toute la structure Sequelize dans ton projet :

```bash
npx sequelize-cli init
```

Cela va générer les dossiers suivants :

```
config/
models/
migrations/
seeders/
```

### 🗁️ Structure obtenue :

```
project/
├─ config/
│   └─ config.json
├─ migrations/
├─ models/
│   └─ index.js
├─ seeders/
└─ package.json
```

---

## ⚙️ 8. Configurer la connexion MySQL

Ouvre le fichier :

```
config/config.json
```

Et adapte-le à ta base de données locale :

```json
{
  "development": {
    "username": "root",
    "password": "",
    "database": "express_db",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": "",
    "database": "express_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": "",
    "database": "express_prod",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

---

## 🗄️ 9. Créer la base de données depuis le terminal

Tu peux créer ta base MySQL directement avec Sequelize CLI :

```bash
npx sequelize-cli db:create
```

Cela crée la base **express_db** dans MySQL.

---

## 🧱 10. Créer un modèle (table)

Exemple : créer une table **Product**

```bash
npx sequelize-cli model:generate --name Product --attributes name:string,price:float
```

Cela crée :
- un fichier dans `models/product.js`
- une migration dans `migrations/xxxx-create-product.js`

---

## 🚀 11. Lancer la migration

Pour appliquer la création de table dans MySQL :

```bash
npx sequelize-cli db:migrate
```

Tu peux ensuite vérifier dans **phpMyAdmin** ou **HeidiSQL** (via Laragon) que la table `Products` a bien été créée.

---

## 🧬 12. Utiliser le modèle dans Express

Dans ton code Express (par exemple `app.js` ou un contrôleur) :

```js
const { Product } = require('./models');

app.get('/products', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});
```

---

## 🧹 13. (Optionnel) Réinitialiser les migrations

Si tu veux tout effacer et recommencer :

```bash
npx sequelize-cli db:drop
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

---

## 🧠 Lexique rapide

| Terme | Définition |
|-------|-------------|
| **ORM** | Outil qui fait le lien entre ton code et la base SQL sans écrire directement des requêtes. |
| **Migration** | Fichier qui décrit comment créer/modifier une table. |
| **Seeder** | Sert à insérer des données de test automatiquement. |
| **Model** | Représente une table dans le code JS. |
| **CLI** | Interface en ligne de commande. |

---

## ✅ Résumé des commandes principales

| Action | Commande |
|--------|-----------|
| Initialiser Sequelize | `npx sequelize-cli init` |
| Créer une base de données | `npx sequelize-cli db:create` |
| Créer un modèle | `npx sequelize-cli model:generate --name Nom --attributes cle:type` |
| Lancer les migrations | `npx sequelize-cli db:migrate` |
| Insérer des données (seeders) | `npx sequelize-cli db:seed:all` |

---

## 🧬 Étape suivante

Tu peux maintenant :
- Créer tes **contrôleurs Express** pour manipuler les données (**CRUD**).
- Ajouter des **routes** (ex: `/api/products`).
- Tester avec **Postman** ou **Insomnia**.

---

Souhaites-tu que je te fasse la **suite du cours complet** (CRUD Sequelize + Express avec tests via Postman et fetch côté React) au **format `.md` et `.pdf`** avec **code coloré et exercices** ?

