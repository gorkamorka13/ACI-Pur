'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'avatar', {
      type: Sequelize.STRING,
      allowNull: true, // Allow null initially, can be updated later if needed
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'avatar');
  }
};
