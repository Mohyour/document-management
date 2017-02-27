const bcrypt = require('bcrypt-nodejs');
const userValues = require('../../data.json').user;

module.exports = {
  up(queryInterface, Sequelize) {
      // Add altering commands here.
      // Return a promise to correctly handle asynchronicity.
    const pass = userValues.password || process.env.PASSWORD;
    const hashedPassword = bcrypt.hashSync(pass, bcrypt.genSaltSync(8));
    return queryInterface.bulkInsert('Users', [{
      username: userValues.username || process.env.USERNAME,
      firstname: userValues.firstname || process.env.FIRSTNAME,
      lastname: userValues.lastname || process.env.LASTNAME,
      email: userValues.email || process.env.EMAIL,
      password: hashedPassword,
      RoleId: userValues.role || process.env.ROLE,
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
