/* eslint-disable no-unused-expressions, no-unused-vars */

import chai from 'chai';
import supertest from 'supertest';
import model from '../../models';
import app from '../../../server';
import helper from '../test-helper';

const request = supertest.agent(app);
const expect = chai.expect;

const adminRoleParam = helper.adminRole;
const regularRoleParam = helper.regularRole;
const adminUserParam = helper.adminUser;
const regularUserParam = helper.regularUser;
const testUserParam = helper.testUser;
const documentOneParam = helper.testDocument;


describe('User api', () => {
  let adminRole, regularRole, adminUser, regularUser,
    adminToken, testUser, regularToken;

  before((done) => {
    model.Role.bulkCreate([adminRoleParam, regularRoleParam], {
      returning: true })
      .then((createdRoles) => {
        adminRole = createdRoles[0];
        regularRole = createdRoles[1];
        adminUserParam.RoleId = adminRole.id;
        regularUserParam.RoleId = regularRole.id;
        testUserParam.RoleId = regularRole.id;
        documentOneParam.RoleId = adminRole.id;

        request.post('/users')
          .send(adminUserParam)
          .end((error, response) => {
            adminUser = response.body.user;
            adminToken = response.body.token;
            done();
          });
      });
  });

  after(() => model.sequelize.sync({ force: true }));

  describe('Post: (/login) - User sign in', () => {
    it('Should sign a user in with correct username and password', (done) => {
      request.post('/login')
        .send({ username: adminUserParam.username,
          password: adminUserParam.password })
        .expect(200)
        .end((err, res) => {
          expect(typeof res.body.token).to.equal('string');
          expect(res.body.expiresIn).to.equal('2 days');
          done();
        });
    });

    it('Should fail for incorrect username and/or password', (done) => {
      request.post('/login')
        .send({ username: 'incorrect user',
          password: 'incorrect password' })
        .expect(401)
        .end((err, res) => {
          expect(res.body.message).to.equal('Login Failed');
          done();
        });
    });

    it('Should log a user out', (done) => {
      request.post('/logout')
        .expect(200)
        .end((err, res) => {
          expect(res.body.message).to.equal('Successful logout');
          done();
        });
    });
  });

  describe('Post: (/users) - Create a user', () => {
    it('Should create a unique user', (done) => {
      request.post('/users')
        .send(adminUserParam)
        .expect(400)
        .end((err, res) => {
          expect(res.body.errors[0].type).to.equal('unique violation');
          done();
        });
    });

    it('Should test if new user has first name and last name', (done) => {
      request.post('/users')
        .set({ 'x-access-token': adminToken })
        .send(regularUserParam)
        .expect(200)
        .end((err, res) => {
          regularUser = res.body.user;
          regularToken = res.body.token;
          expect(regularUser.firstname).to.exist;
          expect(regularUser.lastname).to.exist;
          done();
        });
    });

    it('Should ensure that new user has a role', (done) => {
      request.post('/users')
        .set({ 'x-access-token': adminToken })
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
        .set({ 'x-access-token': adminToken })
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
    it('should not return a user if id is invalid', (done) => {
      request.get('/users/123')
        .set({ 'x-access-token': adminToken })
        .expect(404)
        .end((err, res) => {
          expect(res.body.message).to.be.equal('User Not Found');
          done();
        });
    });

    it('Should return all users', (done) => {
      const fields = ['id', 'username', 'lastname', 'email', 'password', 'RoleId'];
      request.get('/users')
        .set({ 'x-access-token': adminToken })
        .expect(200)
        .end((err, res) => {
          expect(Array.isArray(res.body)).to.equal(true);
          fields.forEach((field) => {
            expect(res.body[0]).to.have.property(field);
          });
          done();
        });
    });

    it('should return user with a correct id', (done) => {
      request.get(`/users/${regularUser.id}`)
        .set({ 'x-access-token': adminToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(regularUser.email).to.equal(regularUserParam.email);
          done();
        });
    });

    it('should return the documents belonging to a user', (done) => {
      request.post('/documents')
      .set({ 'x-access-token': adminToken })
      .send(documentOneParam)
      .then((document) => {
        request.get('/users/1/documents')
        .set({ 'x-access-token': adminToken })
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.length).to.equal(1);
          done();
        });
      });
    });
  });

  describe('Put: (/users/:id) - Update a user', () => {
    it('Should fail to update a user that does not exist', (done) => {
      request.put('/users/783')
        .set({ 'x-access-token': regularToken })
        .expect(404)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to.equal('User Not Found');
          done();
        });
    });

    it('Should fail to update a user if user is not authorized', (done) => {
      request.put('/users/783')
        .expect(404)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to.equal('Not Authorized');
          done();
        });
    });


    it('Should fail to update a user if request is not made by the user', (done) => {
      request.put('/users/1')
        .set({ 'x-access-token': regularToken })
        .send({
          firstname: 'Moyosore',
          lastname: 'Sosan',
        })
        .expect(404)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to.equal('You cannot update this user');
          done();
        });
    });

    it('Should edit and update a user', (done) => {
      request.put(`/users/${regularUser.id}`)
        .set({ 'x-access-token': regularToken })
        .send({
          firstname: 'Moyosore',
          lastname: 'Sosan',
        })
        .expect(200)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.firstname).to.equal('Moyosore');
          expect(res.body.lastname).to.equal('Sosan');
          done();
        });
    });
  });

  describe('Delete (users/:id) - Delete a user', () => {
    it('Should fail to delete a user by non-admin user', (done) => {
      request.delete(`/users/${regularUser.id}`)
        .set({ 'x-access-token': regularToken })
        .expect(403)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message)
            .to.equal('Only an admin is authorized for this request');
          done();
        });
    });

    it('Should fail to delete admin user', (done) => {
      request.delete(`/users/${adminUser.id}`)
        .set({ 'x-access-token': adminToken })
        .expect(403)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message)
            .to.equal('You cannot delete an admin');
          done();
        });
    });

    it('Should fail to delete a user if user is not authorized', (done) => {
      request.delete('/users/1')
        .expect(404)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to.equal('Not Authorized');
          done();
        });
    });

    it('Should fail to delete a user that does not exist', (done) => {
      request.delete('/users/123')
        .set({ 'x-access-token': adminToken })
        .expect(404)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to.equal('User Not Found');
          done();
        });
    });

    it('Should find and delete a user if user exist', (done) => {
      request.delete(`/users/${regularUser.id}`)
        .set({ 'x-access-token': adminToken })
        .expect(200)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to.equal('User Deleted');
          done();
        });
    });
  });
});