/* eslint-disable no-unused-expressions */

import chai from 'chai';
import model from '../../models/index';
import helper from '../test-helper';

const expect = chai.expect;
const userParams = helper.regularUser;
const roleParams = helper.adminRole;

const requiredFields = ['username', 'firstname', 'lastname', 'email',
  'password', 'RoleId'];
const uniqueFields = ['username', 'email'];

describe('User Model', () => {
  describe('How user model is structured', () => {
    let user;
    before((done) => {
      model.Role.create(roleParams)
        .then((createdRole) => {
          userParams.RoleId = createdRole.id; // assign role id to user
          return model.User.create(userParams);
        })
        .then((createdUser) => {
          user = createdUser;
          done();
        });
    });

    after(() => model.sequelize.sync({ force: true }));

    it('should be able to create a user', () => {
      expect(user).to.exist;
      expect(typeof user).to.equal('object');
    });
    it('should create a user with username, first & last name', () => {
      expect(user.username).to.equal(userParams.username);
      expect(user.firstname).to.equal(userParams.firstname);
      expect(user.lastname).to.equal(userParams.lastname);
    });
    it('should create a user with a valid email', () => {
      expect(user.email).to.equal(userParams.email);
    });
    it('should create a user with hashed password', () => {
      expect(user.password).to.not.equal(userParams.password);
    });
    it('should create a user with a defined Role', () => {
      model.User.findById(user.id, { include: [model.Role] })
        .then((foundUser) => {
          expect(foundUser.Role.title).to.equal(roleParams.title);
        });
    });

    it('should be able to update a user', (done) => {
      model.User.findById(user.id)
        .then((foundUser) => {
          return foundUser.update({ username: 'moyosore' });
        })
        .then((updatedUser) => {
          expect(updatedUser.username).to.equal('moyosore');
          done();
        });
    });
  });

  describe('User model validation', () => {
    let user;
    beforeEach((done) => {
      model.Role.create(roleParams)
        .then((role) => {
          userParams.RoleId = role.id;
          user = model.User.build(userParams);
          done();
        });
    });

    afterEach(() => model.sequelize.sync({ force: true }));

    describe('Required Fields', () => {
      requiredFields.forEach((field) => {
        it(`requires ${field} field to create a user`, () => {
          user[field] = null;
          return user.save()
            .catch((error) => {
              expect(/notNull Violation/.test(error.message)).to.be.true;
            });
        });
      });
    });

    describe('Unique Fields', () => {
      uniqueFields.forEach((field) => {
        it(`requires ${field} field to be Unique`, () => {
          user.save()
            .then((firstUser) => {
              userParams.RoleId = firstUser.RoleId;
              // attempt to create another user with same parameters
              return model.User.build(userParams).save();
            })
            .catch((error) => {
              expect(/UniqueConstraintError/.test(error.name)).to.be.true;
            });
        });
      });
    });

    describe('Mail Validation', () => {
      it('requires user mail to be authentic', () => {
        user.email = 'moyo mail';
        return user.save()
          .then((unsavedUser) => {
            expect(unsavedUser).to.exist;
          })
          .catch((error) => {
            expect(/isEmail failed/.test(error.name)).to.be.true;
          });
      });
    });

    describe('Password Validation', () => {
      it('should be valid if compared with hashed password', () => {
        return user.save()
          .then((createdUser) => {
            expect(createdUser.validPassword(userParams.password)).to.be.true;
          });
      });
    });
  });
});
