'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('health_check', {
      id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
      createAt: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW')}
    })
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
