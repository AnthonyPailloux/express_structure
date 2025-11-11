'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // La fonction up() contient les modifications à appliquer à la base de données
    // Elle sera exécutée quand on fait : npm run db:migrate
    
    // Création de la table 'health_check' avec ses colonnes
    await queryInterface.createTable('health_check', {
      // Colonne id : entier, auto-incrémenté, clé primaire
      id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
      // Colonne createAt : date, obligatoire, valeur par défaut = maintenant
      createAt: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW')}
    })
  },

  async down (queryInterface, Sequelize) {
    // La fonction down() permet d'annuler (undo) les modifications faites dans up()
    // Ici, comme up() crée la table 'health_check', down() doit la supprimer
    
    // Suppression de la table 'health_check' de la base de données
    // Cette commande sera exécutée quand on fait : npm run db:migrate:undo
    await queryInterface.dropTable('health_check');
  }
};
