/* eslint-disable no-unused-vars */
module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('Documents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      content: {
        type: Sequelize.TEXT
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      access: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'public',
        validate: {
          isIn: [['private', 'public', 'role']]
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },
  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('Documents');
  }
};
