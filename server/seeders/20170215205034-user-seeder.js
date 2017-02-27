const bcrypt = require('bcrypt-nodejs');
// const userValues = require('../../data.json').user;

module.exports = {
  up(queryInterface, Sequelize) {
      // Add altering commands here.
      // Return a promise to correctly handle asynchronicity.
    const pass = process.env.PASSWORD;
    const hashedPassword = bcrypt.hashSync(pass, bcrypt.genSaltSync(8));
    return queryInterface.bulkInsert('Users', [{
      username: process.env.USERNAME,
      firstname: process.env.FIRSTNAME,
      lastname: process.env.LASTNAME,
      email: process.env.EMAIL,
      password: hashedPassword,
      RoleId: process.env.ROLE,
      createdAt: Sequelize.fn(('NOW')),
      updatedAt: Sequelize.fn(('NOW'))
    }], { individualHooks: true });
  },

  down(queryInterface, Sequelize) { // eslint-disable-line no-unused-vars
      // Add reverting commands here.
      // Return a promise to correctly handle asynchronicity.
    return queryInterface.delete('Users', null, {});
  }
};
