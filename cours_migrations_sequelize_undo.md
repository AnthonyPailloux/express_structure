# 🧠 Cours : Migrations Sequelize - Exécution et Undo (Annulation)

## 🌟 Objectif
Comprendre comment fonctionnent les **migrations Sequelize**, comment les **exécuter** et comment les **annuler (undo)** pour gérer l'évolution de ta base de données.

---

## 📚 1. Qu'est-ce qu'une migration ?

Une **migration** est un fichier qui décrit les modifications à apporter à ta base de données (création de table, ajout de colonne, modification de structure, etc.).

### Pourquoi utiliser des migrations ?
- ✅ **Versionner** l'évolution de ta base de données
- ✅ **Reproduire** la structure de la base sur différents environnements (dev, test, prod)
- ✅ **Annuler** des modifications si nécessaire (undo)
- ✅ **Travailler en équipe** : tout le monde a la même structure de base

---

## 🏗️ 2. Structure d'une migration

Chaque migration contient **deux fonctions principales** :

### ✨ Fonction `up()` - Appliquer la migration
Cette fonction contient les modifications à **appliquer** à la base de données.
Elle est exécutée quand tu fais : `npm run db:migrate`

### ⬇️ Fonction `down()` - Annuler la migration
Cette fonction contient les modifications pour **annuler** ce que `up()` a fait.
Elle est exécutée quand tu fais : `npm run db:migrate:undo`

### 📝 Exemple de structure

```javascript
'use strict';

module.exports = {
  // Cette fonction APPLIQUE la migration
  async up (queryInterface, Sequelize) {
    // Création d'une table
    await queryInterface.createTable('health_check', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      createAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    })
  },

  // Cette fonction ANNULE la migration
  async down (queryInterface, Sequelize) {
    // Suppression de la table créée dans up()
    await queryInterface.dropTable('health_check');
  }
};
```

---

## 🚀 3. Exécuter une migration

### Étape 1 : Créer une migration
Génère un nouveau fichier de migration :

```bash
npx sequelize-cli migration:generate --name create-health-checks
```

**Résultat** : Un fichier est créé dans `src/migrations/` avec un nom comme :
- `20251110104402-create-health-checks.js`

> 💡 **Note** : Le préfixe numérique (20251110104402) est un **timestamp** qui garantit l'ordre d'exécution des migrations.

### Étape 2 : Écrire la migration
Édite le fichier de migration et complète les fonctions `up()` et `down()` :

```javascript
async up (queryInterface, Sequelize) {
  // Ce que tu veux FAIRE
  await queryInterface.createTable('health_check', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    createAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
  })
},

async down (queryInterface, Sequelize) {
  // Ce que tu veux ANNULER (l'inverse de up())
  await queryInterface.dropTable('health_check');
}
```

### Étape 3 : Exécuter la migration
Lance la migration pour l'appliquer à la base de données :

```bash
npm run db:migrate
```

**Ou directement** :
```bash
npx sequelize-cli db:migrate
```

### 📊 Ce qui se passe lors de l'exécution
1. Sequelize vérifie quelles migrations ont déjà été exécutées (table `SequelizeMeta`)
2. Il exécute uniquement les migrations **non encore appliquées**
3. Il appelle la fonction `up()` de chaque nouvelle migration
4. Il enregistre le nom de la migration dans la table `SequelizeMeta`

**Exemple de sortie** :
```
== 20251110104402-create-health-checks: migrating =======
== 20251110104402-create-health-checks: migrated (0.038s)
```

---

## ⏪ 4. Annuler une migration (Undo)

### Annuler la dernière migration
Pour annuler la **dernière migration** exécutée :

```bash
npm run db:migrate:undo
```

**Ou directement** :
```bash
npx sequelize-cli db:migrate:undo
```

### 📊 Ce qui se passe lors de l'undo
1. Sequelize récupère la **dernière migration** exécutée
2. Il appelle la fonction `down()` de cette migration
3. Il supprime l'enregistrement de la migration dans la table `SequelizeMeta`

**Exemple de sortie** :
```
== 20251110104402-create-health-checks: reverting =======
== 20251110104402-create-health-checks: reverted (0.025s)
```

### ⚠️ Important : La fonction `down()` doit être complétée !
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

---

## 🔄 5. Autres commandes utiles

### Vérifier l'état des migrations
Voir quelles migrations ont été exécutées :

```bash
npx sequelize-cli db:migrate:status
```

**Résultat** :
```
up   20251110104402-create-health-checks.js
down 20251110104500-create-users.js
```

- `up` = migration exécutée ✅
- `down` = migration non exécutée ❌

### Annuler toutes les migrations
Pour annuler **toutes** les migrations en une fois :

```bash
npx sequelize-cli db:migrate:undo:all
```

> ⚠️ **Attention** : Cette commande annule **toutes** les migrations, pas seulement la dernière !

### Annuler jusqu'à une migration spécifique
Annuler les migrations jusqu'à une date précise :

```bash
npx sequelize-cli db:migrate:undo --to XXXX-XX-XX-XXXXXX-nom-migration.js
```

---

## 📋 6. Cas d'usage courants

### Cas 1 : Créer une table
```javascript
async up (queryInterface, Sequelize) {
  await queryInterface.createTable('products', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    price: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false
    }
  });
},

async down (queryInterface, Sequelize) {
  await queryInterface.dropTable('products');
}
```

### Cas 2 : Ajouter une colonne à une table existante
```javascript
async up (queryInterface, Sequelize) {
  await queryInterface.addColumn('products', 'description', {
    type: Sequelize.TEXT,
    allowNull: true
  });
},

async down (queryInterface, Sequelize) {
  await queryInterface.removeColumn('products', 'description');
}
```

### Cas 3 : Modifier une colonne
```javascript
async up (queryInterface, Sequelize) {
  await queryInterface.changeColumn('products', 'price', {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  });
},

async down (queryInterface, Sequelize) {
  await queryInterface.changeColumn('products', 'price', {
    type: Sequelize.FLOAT,
    allowNull: false
  });
}
```

### Cas 4 : Supprimer une colonne
```javascript
async up (queryInterface, Sequelize) {
  await queryInterface.removeColumn('products', 'description');
},

async down (queryInterface, Sequelize) {
  await queryInterface.addColumn('products', 'description', {
    type: Sequelize.TEXT,
    allowNull: true
  });
}
```

### Cas 5 : Créer un index
```javascript
async up (queryInterface, Sequelize) {
  await queryInterface.addIndex('products', ['name'], {
    name: 'idx_products_name'
  });
},

async down (queryInterface, Sequelize) {
  await queryInterface.removeIndex('products', 'idx_products_name');
}
```

---

## 🎯 7. Bonnes pratiques

### ✅ À FAIRE

1. **Toujours compléter la fonction `down()`**
   - L'undo doit être l'inverse exact de `up()`
   - Si `up()` crée une table, `down()` doit la supprimer
   - Si `up()` ajoute une colonne, `down()` doit la retirer

2. **Tester l'undo après avoir créé une migration**
   ```bash
   npm run db:migrate        # Appliquer
   npm run db:migrate:undo   # Annuler
   npm run db:migrate        # Réappliquer
   ```

3. **Utiliser des noms de migration descriptifs**
   - ✅ `create-health-checks`
   - ✅ `add-description-to-products`
   - ❌ `migration1`
   - ❌ `update-table`

4. **Ne jamais modifier une migration déjà exécutée en production**
   - Crée plutôt une nouvelle migration pour corriger

5. **Vérifier l'état avant d'exécuter**
   ```bash
   npx sequelize-cli db:migrate:status
   ```

### ❌ À ÉVITER

1. **Ne pas laisser `down()` vide**
   - Tu ne pourras pas annuler la migration

2. **Ne pas modifier les migrations déjà exécutées**
   - Cela peut créer des incohérences

3. **Ne pas supprimer manuellement des enregistrements dans `SequelizeMeta`**
   - Utilise les commandes Sequelize CLI

4. **Ne pas mélanger les ordres de migration**
   - Les timestamps garantissent l'ordre, ne les modifie pas

---

## 🔧 8. Résolution de problèmes

### Problème 1 : "Dialect undefined"
**Erreur** : `ERROR: Dialect undefined does not support db:create / db:drop commands`

**Solution** : Vérifie que ton fichier `config/config.js` ou `config/config.json` contient bien le `dialect: 'mysql'`

```javascript
module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',  // ← Important !
    // ...
  }
}
```

### Problème 2 : Migration déjà exécutée
**Erreur** : Tu veux réexécuter une migration mais elle est déjà appliquée

**Solution** : 
1. Vérifie l'état : `npx sequelize-cli db:migrate:status`
2. Si elle est `up`, annule-la d'abord : `npm run db:migrate:undo`
3. Puis réexécute : `npm run db:migrate`

### Problème 3 : La fonction `down()` ne fonctionne pas
**Erreur** : L'undo ne fait rien ou génère une erreur

**Solution** :
1. Vérifie que `down()` contient bien la logique inverse de `up()`
2. Vérifie les noms de tables/colonnes (sensibilité à la casse)
3. Teste manuellement la requête SQL dans phpMyAdmin

### Problème 4 : Table `SequelizeMeta` manquante
**Erreur** : Sequelize ne trouve pas la table de suivi des migrations

**Solution** : Exécute une première migration, elle créera automatiquement la table `SequelizeMeta`

---

## 📊 9. Table SequelizeMeta

Sequelize utilise une table spéciale `SequelizeMeta` pour suivre quelles migrations ont été exécutées.

### Structure de la table
```sql
CREATE TABLE `SequelizeMeta` (
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`name`)
);
```

### Contenu
Cette table contient le nom de chaque migration exécutée :
```
name
----------------------------------------
20251110104402-create-health-checks.js
20251110105000-create-products.js
```

### ⚠️ Ne modifie pas manuellement cette table !
Laisse Sequelize la gérer automatiquement via les commandes CLI.

---

## 🎓 10. Résumé des commandes

| Action | Commande | Description |
|--------|----------|-------------|
| **Créer une migration** | `npx sequelize-cli migration:generate --name nom-migration` | Génère un nouveau fichier de migration |
| **Exécuter les migrations** | `npm run db:migrate` | Applique toutes les migrations en attente |
| **Annuler la dernière migration** | `npm run db:migrate:undo` | Annule la dernière migration exécutée |
| **Annuler toutes les migrations** | `npx sequelize-cli db:migrate:undo:all` | Annule toutes les migrations |
| **Vérifier l'état** | `npx sequelize-cli db:migrate:status` | Affiche quelles migrations sont appliquées |

---

## 🧪 11. Exercice pratique

### Exercice : Créer et tester une migration

1. **Créer une migration pour une table `categories`**
   ```bash
   npx sequelize-cli migration:generate --name create-categories
   ```

2. **Compléter la migration** avec :
   - Colonne `id` (INTEGER, primary key, auto-increment)
   - Colonne `name` (STRING, obligatoire)
   - Colonnes `createdAt` et `updatedAt` (DATE)

3. **Compléter la fonction `down()`** pour supprimer la table

4. **Exécuter la migration**
   ```bash
   npm run db:migrate
   ```

5. **Vérifier l'état**
   ```bash
   npx sequelize-cli db:migrate:status
   ```

6. **Tester l'undo**
   ```bash
   npm run db:migrate:undo
   ```

7. **Vérifier que la table a bien été supprimée**

8. **Réexécuter la migration**
   ```bash
   npm run db:migrate
   ```

---

## ✅ Checklist avant de committer une migration

Avant de committer une migration dans Git, vérifie :

- [ ] La fonction `up()` est complète et fonctionne
- [ ] La fonction `down()` est complète et fait l'inverse de `up()`
- [ ] J'ai testé l'exécution : `npm run db:migrate`
- [ ] J'ai testé l'undo : `npm run db:migrate:undo`
- [ ] J'ai réexécuté après l'undo : `npm run db:migrate`
- [ ] Le nom de la migration est descriptif
- [ ] Aucune erreur dans la console

---

## 🎯 Conclusion

Les migrations Sequelize permettent de :
- ✅ **Versionner** l'évolution de ta base de données
- ✅ **Appliquer** des modifications de façon contrôlée
- ✅ **Annuler** des modifications si nécessaire
- ✅ **Travailler en équipe** avec une structure cohérente

**Rappel important** : 
- `up()` = Appliquer la migration
- `down()` = Annuler la migration
- Toujours tester les deux avant de committer !

---

## 📚 Ressources supplémentaires

- [Documentation officielle Sequelize - Migrations](https://sequelize.org/docs/v6/other-topics/migrations/)
- [Documentation Sequelize CLI](https://github.com/sequelize/cli)

---

**Bon courage avec tes migrations ! 🚀**

