import chai from 'chai';
import supertest from 'supertest';
import model from '../../models';
import app from '../../../server';
import helper from '../test-helper';

const request = supertest.agent(app);
const expect = chai.expect;

const adminRole = helper.adminRole;
const regularRole = helper.regularRole;
const adminUser = helper.adminUser;
const regularUser = helper.regularUser;


let adminToken;
let regularToken;
let role;
describe('Role api', () => {
  before((done) => {
    model.Role.bulkCreate([adminRole, regularRole], { returning: true })
      .then((createdRoles) => {
        const admin = createdRoles[0];
        const regular = createdRoles[1];
        adminUser.RoleId = admin.id;
        regularUser.RoleId = regular.id;
        role = regular;
        request.post('/users')
          .send(adminUser)
          .end((error, response) => {
            adminToken = response.body.token;
            expect(response.status).to.equal(201);
          });
        request.post('/users')
        .send(regularUser)
        .end((err, res) => {
          regularToken = res.body.token;
          done();
        });
      });
  });

  after(() => model.sequelize.sync({ force: true }));

  describe('Post (/roles)', () => {
    it('Should create a role when required field is valid', (done) => {
      const newRole = { title: 'super admin' };
      request.post('/roles')
      .set({ 'x-access-token': adminToken })
      .send(newRole)
      .end((error, response) => {
        expect(response.status).to.equal(201);
        expect(response.body.title).to.equal(newRole.title);
        done();
      });
    });

    it('Ensures that role cannot be created if creator is not authenticated',
    (done) => {
      request.post('/roles')
        .send(regularRole)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('Ensures an admin can create a new role', (done) => {
      request.post('/roles')
        .set({ 'x-access-token': adminToken })
        .send({ title: 'new role' })
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          expect(typeof res.body).to.equal('object');
          expect(res.body.title).to.equal('new role');
          done();
        });
    });

    it('Should have a unique role title', (done) => {
      request.post('/roles')
        .set({ 'x-access-token': adminToken })
        .send(regularRole)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.message[0]).to.equal('title must be unique');
          done();
        });
    });

    it('Should ensure non admin cannot create a role', (done) => {
      request.post('/roles')
        .set({ 'x-access-token': regularToken })
        .send({ title: 'new role' })
        .expect(403)
        .end((err, res) => {
          if (err) return done(err);
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to
          .equal('Only an admin is authorized for this request');
          done();
        });
    });

    it('Should fail if a title is null', (done) => {
      request.post('/roles')
        .set({ 'x-access-token': adminToken })
        .send()
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.message[0]).to
          .equal('title cannot be null');
          done();
        });
    });

    describe('Get: (/roles/) - Get role', () => {
      it('Should get all roles with pagination', (done) => {
        request.get('/roles?limit=1&offset=1')
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.roles.length).to.be.greaterThan(0);
            expect(typeof res.body.metadata).to.equal('object');
            done();
          });
      });

      it('Should not return the role when supplied invalid id', (done) => {
        request.get('/roles/123')
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(404);
            done();
          });
      });

      it('Should return error message for invalid input', (done) => {
        request.get('/roles/hello')
          .set({ 'x-access-token': adminToken })
          .expect(400)
          .end((err, res) => {
            expect(typeof res.body).to.equal('object');
            expect(res.body.message).to
            .equal('invalid input syntax for integer: "hello"');
            done();
          });
      });

      it('Should return the role when valid id is provided', (done) => {
        request.get(`/roles/${role.id}`)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            done();
          });
      });

      it('Should validate that atleast regular and admin role exist',
      (done) => {
        request.get('/roles')
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            expect(res.body.roles[2].title).to.equal('admin');
            expect(res.body.roles[3].title).to.equal('regular');
            done();
          });
      });
    });

    describe('Put (/roles/:id) - Update role', () => {
      it('Should return error message for invalid input', (done) => {
        request.get('/roles/hello')
          .set({ 'x-access-token': adminToken })
          .expect(400)
          .end((err, res) => {
            expect(typeof res.body).to.equal('object');
            expect(res.body.message).to
            .equal('invalid input syntax for integer: "hello"');
            done();
          });
      });

      it('Should update a role', (done) => {
        request.put('/roles/2')
          .set({ 'x-access-token': adminToken })
          .send({ title: 'updated role' })
          .expect(200)
          .end((err, res) => {
            expect(res.body.title).to.equal('updated role');
            expect(res.body.id).to.equal(2);
            done();
          });
      });

      it('Should fail to update a role by a non admin', (done) => {
        request.put('/roles/2')
          .set({ 'x-access-token': regularToken })
          .send({ title: 'updated role' })
          .expect(403)
          .end((err, res) => {
            expect(typeof res.body).to.equal('object');
            expect(res.body).to.have.property('message');
            expect(res.body.message)
              .to.equal('Only an admin is authorized for this request');
            done();
          });
      });

      it('Should fail if a role does not exist', (done) => {
        request.put('/roles/123')
          .set({ 'x-access-token': adminToken })
          .send({ title: 'updated role' })
          .expect(404)
          .end((err, res) => {
            expect(typeof res.body).to.equal('object');
            expect(res.body).to.have.property('message');
            expect(res.body.message)
              .to.equal('Role Not Found');
            done();
          });
      });
    });

    describe('Delete (/roles/:id) - Delete role', () => {
      it('Should return error message for invalid input', (done) => {
        request.get('/roles/hello')
          .set({ 'x-access-token': adminToken })
          .expect(400)
          .end((err, res) => {
            expect(typeof res.body).to.equal('object');
            expect(res.body.message).to
            .equal('invalid input syntax for integer: "hello"');
            done();
          });
      });

      it('Should fail to delete a role by a non admin', (done) => {
        request.delete('/roles/2')
          .set({ 'x-access-token': regularToken })
          .expect(403)
          .end((err, res) => {
            expect(typeof res.body).to.equal('object');
            expect(res.body).to.have.property('message');
            expect(res.body.message)
              .to.equal('Only an admin is authorized for this request');
            done();
          });
      });

      it('Should delete a role', (done) => {
        request.delete('/roles/2')
          .set({ 'x-access-token': adminToken })
          .expect(200).end((err, res) => {
            expect(typeof res.body).to.equal('object');
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.equal('Role Deleted');
            done();
          });
      });

      it('Should fail if a role does not exist', (done) => {
        request.delete('/roles/10')
          .set({ 'x-access-token': adminToken })
          .expect(404).end((err, res) => {
            expect(typeof res.body).to.equal('object');
            expect(res.body).to.have.property('message');
            expect(res.body.message)
              .to.equal('Role Not Found');
            done();
          });
      });
    });
  });
});
