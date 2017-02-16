/* eslint-disable no-unused-vars */
import chai from 'chai';
import supertest from 'supertest';
import model from '../models';
import app from '../../server';
import helper from './test-helper';

const request = supertest.agent(app);
const expect = chai.expect;

const adminRole = helper.adminRole;
const regularRole = helper.regularRole;

describe('Role api', () => {
  before((done) => {
    model.Role.bulkCreate([adminRole, regularRole], { returning: true })
      .then((createdRoles) => {
        const admin = createdRoles[0];
        const regular = createdRoles[1];
        done();
      });
  });

  after(() => model.sequelize.sync({ force: true }));

  describe('Post (/roles)', () => {
    it('should create a role when required field is valid', (done) => {
      const newRole = { title: 'super admin' };
      request.post('/roles')
      .send(newRole)
      .end((error, response) => {
        expect(response.status).to.equal(201);
        expect(response.body.title).to.equal(newRole.title);
        done();
      });
    });

    it('Ensures a new role can be created', (done) => {
      request.post('/roles')
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
        .send(regularRole)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.errors[0].message).to.equal('title must be unique');
          done();
        });
    });

    it('Should fail if a title is null', (done) => {
      request.post('/roles')
        .send()
        .expect(500)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.errors[0].message).to.equal('title cannot be null');
          done();
        });
    });

    describe('Get: (/roles/:id) - Get role', () => {
      it('should get all roles when called', (done) => {
        request.get('/roles')
          .end((err, res) => {
            expect(res.status).to.equal(200);
            done();
          });
      });

      it('should not return the role when supplied invalid id', (done) => {
        request.get('/roles/123')
          .end((err, res) => {
            expect(res.status).to.equal(404);
            done();
          });
      });

      it('should return the role when valid id is provided', (done) => {
        request.get('/roles/1')
          .end((err, res) => {
            expect(res.status).to.equal(200);
            done();
          });
      });

      it('should validate that atleast regular and admin role exist', (done) => {
        request.get('/roles')
          .end((err, res) => {
            expect(res.body[0].title).to.equal('admin');
            expect(res.body[1].title).to.equal('regular');
            done();
          });
      });
    });

    describe('Put (/roles/:id) - Update role', () => {
      it('Should update a role', (done) => {
        request.put('/roles/2')
          .send({ title: 'updated role' })
          .expect(200)
          .end((err, res) => {
            expect(res.body.title).to.equal('updated role');
            expect(res.body.id).to.equal(2);
            done();
          });
      });

      it('Should fail if a role does not exist', (done) => {
        request.put('/roles/123')
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
      it('Should delete a role', (done) => {
        request.delete('/roles/2')
          .expect(200).end((err, res) => {
            expect(typeof res.body).to.equal('object');
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.equal('Role Deleted');
            done();
          });
      });

      it('Should fail if a role does not exist', (done) => {
        request.delete('/roles/10')
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
