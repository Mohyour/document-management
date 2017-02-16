/* eslint-disable no-unused-expressions, no-unused-vars */

import chai from 'chai';
import supertest from 'supertest';
import model from '../models';
import app from '../../server';
import helper from './test-helper';

const request = supertest.agent(app);
const expect = chai.expect;

const adminRoleParam = helper.adminRole;
const regularRoleParam = helper.regularRole;
const adminUserParam = helper.adminUser;
const regularUserParam = helper.regularUser;
const testUserParam = helper.testUser;


describe('User api', () => {
  let adminRole, regularRole, adminUser, regularUser,
    adminToken, testUser;

  before((done) => {
    model.Role.bulkCreate([adminRoleParam, regularRoleParam], {
      returning: true })
      .then((createdRoles) => {
        adminRole = createdRoles[0];
        regularRole = createdRoles[1];
        adminUserParam.RoleId = adminRole.id;
        regularUserParam.RoleId = regularRole.id;
        testUserParam.RoleId = regularRole.id;

        request.post('/users')
          .send(adminUserParam)
          .end((error, response) => {
            adminUser = response.body;
            done();
          });
      });
  });

  after(() => model.sequelize.sync({ force: true }));

  describe('Post: (/users) - Create a user', () => {
    it('Should create a unique user', (done) => {
      request.post('/users')
        .send(adminUserParam)
        .expect(500)
        .end((err, res) => {
          expect(res.body.errors[0].type).to.equal('unique violation');
          done();
        });
    });

    it('Should test if new user has first name and last name', (done) => {
      request.post('/users')
        .send(regularUserParam)
        .expect(200)
        .end((err, res) => {
          regularUser = res.body;
          expect(regularUser.firstname).to.exist;
          expect(regularUser.lastname).to.exist;
          done();
        });
    });

    it('Should ensure that new user has a role', (done) => {
      request.post('/users')
        .expect(201)
        .end((err, res) => {
          expect(regularUser).to.have.property('RoleId');
          expect(regularUser.RoleId).to.equal(2);
          done();
        });
    });

    it('Should ensure user cannot be created if one of email or password is lacking.', (done) => {
      testUserParam.email = null;
      testUserParam.password = null;
      request.post('/users')
        .send(testUserParam)
        .expect(500)
        .end((err, res) => {
          expect(res.body.errors[0].message).to.equal('email cannot be null');
          expect(res.body.errors[1].message).to.equal('password cannot be null');
          done();
        });
    });
  });

  describe('Get: (/users/) - Get a user', () => {
    it('should not return a user id is invalid', (done) => {
      request.get('/users/123')
        .expect(404)
        .end((err, res) => {
          expect(res.body.message).to.be.equal('User Not Found');
          done();
        });
    });

    it('Should return all users', (done) => {
      request.get('/users')
        .expect(200)
        .end((err, res) => {
          expect(Array.isArray(res.body)).to.equal(true);
          expect(res.body[0]).to.have.property('id');
          expect(res.body[0]).to.have.property('firstname');
          expect(res.body[0]).to.have.property('lastname');
          expect(res.body[0]).to.have.property('username');
          expect(res.body[0]).to.have.property('email');
          expect(res.body[0]).to.have.property('RoleId');
          done();
        });
    });

    it('should return the user with a correct id', (done) => {
      request.get(`/users/${regularUser.id}`)
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(regularUser.email).to.equal(regularUserParam.email);
          done();
        });
    });
  });

  describe('Put: (/users/:id) - Update a user', () => {
    it('Should edit and update a user', (done) => {
      request.put(`/users/${regularUser.id}`)
        .send({
          firstname: 'Moyosore',
          lastname: 'Sosan',
          password: 'mypassword'
        })
        .expect(200)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.firstname).to.equal('Moyosore');
          expect(res.body.lastname).to.equal('Sosan');
          done();
        });
    });

    it('Should fail to update a user that does not exist', (done) => {
      request.put('/users/783')
        .expect(404)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to.equal('User Not Found');
          done();
        });
    });

    it('Should fail to delete a user that does not exist', (done) => {
      request.delete('/users/123')
        .expect(404)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to.equal('User Not Found');
          done();
        });
    });

    it('Should find and delete a user if user exist', (done) => {
      request.delete('/users/1')
        .expect(200)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to.equal('User Deleted');
          done();
        });
    });
  });
});
