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
const documentOne = helper.testDocument;
const documentTwo = helper.testDocument2;
const documentThree = helper.testDocument3;

describe('Documnet api', () => {
  let document, adminRole, regularRole, adminUser, regularUser,
    adminToken, testUser, regularToken, testToken;

  before((done) => {
    model.Role.bulkCreate([adminRoleParam, regularRoleParam], {
      returning: true })
      .then((createdRoles) => {
        adminRole = createdRoles[0];
        regularRole = createdRoles[1];
        adminUserParam.RoleId = adminRole.id;
        // Two users here are assigned same RoleId to demonstrate role access
        regularUserParam.RoleId = regularRole.id;
        testUserParam.RoleId = regularRole.id;

        request.post('/users')
          .send(adminUserParam)
          .end((error, response) => {
            adminUser = response.body.user;
            adminToken = response.body.token;
            documentOne.UserId = adminUser.id;
            documentOne.RoleId = adminRole.id;

            request.post('/users')
              .send(regularUserParam)
              .end((err, res) => {
                regularUser = res.body.user;
                regularToken = res.body.token;
                documentTwo.UserId = regularUser.id;
                documentTwo.RoleId = regularRole.id;

                request.post('/users')
                  .send(testUserParam)
                  .end((err, res) => {
                    testUser = res.body.user;
                    testToken = res.body.token;
                    documentThree.UserId = testUser.id;
                    documentThree.RoleId = regularRole.id;
                    done();
                  });
              });
          });
      });
  });

  after(() => model.sequelize.sync({ force: true }));

  describe('Post (/documents) - Create document', () => {
    it('Should have a published date defined', (done) => {
      request.post('/documents')
        .set({ 'x-access-token': adminToken })
        .send(documentOne)
        .expect(201)
        .end((err, res) => {
          document = res.body;
          expect(res.body).to.have.property('createdAt');
          expect(res.body.createdAt).not.to.equal(null);
          done();
        });
    });

    it('Should have valid attributes', (done) => {
      expect(document).to.have.property('title');
      expect(document).to.have.property('content');
      done();
    });

    it('Should create a document with a unique title', (done) => {
      request.post('/documents')
        .set({ 'x-access-token': adminToken })
        .send(documentOne)
        .end((err, res) => {
          request.post('/documents')
            .set({ 'x-access-token': adminToken })
            .send(documentOne)
            .end((err, res) => {
              expect(res.body.errors[0].message).to.equal('title must be unique');
              done();
            });
        });
    });

    it('Should ensure that document has an owner', (done) => {
      request.post('/documents')
        .set({ 'x-access-token': adminToken })
        .send(documentTwo)
        .expect(201)
        .end((err, res) => {
          document = res.body;
          expect(res.body.UserId).to.equal(regularUser.id);
          done();
        });
    });

    it('Should ensure that document has a role that can access it', (done) => {
      expect(document.RoleId).to.equal(regularRole.id);
      done();
    });

    it('Should ensure that document cannot be created if title is lacking', (done) => {
      documentTwo.title = null;
      request.post('/documents')
        .set({ 'x-access-token': adminToken })
        .send(documentTwo)
        .expect(201)
        .end((err, res) => {
          expect(res.body.errors[0].message).to.equal('title cannot be null');
          done();
        });
    });
  });

  describe('Get (/document:id) - Get document', () => {
    it('Should return all documents', (done) => {
      request.get('/documents')
        .set({ 'x-access-token': regularToken })
        .expect(200).end((err, res) => {
          expect(Array.isArray(res.body)).to.equal(true);
          expect(res.body.length).to.be.greaterThan(0);
          expect(res.body[0].title).to.equal(documentOne.title);
          done();
        });
    });

    it('Should return a document with specified id', (done) => {
      request.get('/documents/1')
        .set({ 'x-access-token': regularToken })
        .expect(200).end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.UserId).to.equal(adminUser.id);
          expect(res.body.title).to.equal(documentOne.title);
          done();
        });
    });
  });

  describe('PUT: (/documents/:id) - EDIT A DOCUMENT', () => {
    it('should not perform edit if invalid id is provided', (done) => {
      const newContent = { content: 'replace previous document' };
      request.put('/documents/123')
        .set({ 'x-access-token': regularToken })
        .send(newContent)
        .expect(404)
        .end((error, response) => {
          expect(response.body.message).to.equal('Document Not Found');
          done();
        });
    });

    it('should not perform edit if User is not authorized', (done) => {
      const newContent = { content: 'replace previous document' };
      request.put('/documents/2')
        .send(newContent)
        .expect(401, done);
    });

    it('should edit document if valid id is provided', (done) => {
      const newContent = { content: 'replace previous document' };
      request.put('/documents/1')
        .set({ 'x-access-token': adminToken })
        .send(newContent)
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.content).to.equal(newContent.content);
          done();
        });
    });
  });

  describe('Delete (/document/:id) - Delete a document', () => {
    it('should not delete if user is not authorized', (done) => {
      const newContent = { content: 'replace previous document' };
      request.delete('/documents/2')
        .send(newContent)
        .expect(401, done);
    });

    it('Should delete a document', (done) => {
      request.delete('/documents/1')
        .set({ 'x-access-token': adminToken })
        .expect(200)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to.equal('Document Deleted');
          done();
        });
    });

    it('Should fail if document does not exist', (done) => {
      request.delete('/documents/123')
        .set({ 'x-access-token': regularToken })
        .expect(404)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to.equal('Document Not Found');
          done();
        });
    });
  });
});
