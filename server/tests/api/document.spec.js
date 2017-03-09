/* eslint-disable no-unused-expressions */
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
const documentOne = helper.testDocument;
const documentTwo = helper.testDocument2;

describe('Documnet api', () => {
  let document;
  let adminRole;
  let regularRole;
  let adminUser;
  let regularUser;
  let adminToken;
  let regularToken;

  before((done) => {
    model.Role.bulkCreate([adminRoleParam, regularRoleParam], {
      returning: true })
      .then((createdRoles) => {
        adminRole = createdRoles[0];
        regularRole = createdRoles[1];
        adminUserParam.RoleId = adminRole.id;
        regularUserParam.RoleId = regularRole.id;

        request.post('/users')
          .send(adminUserParam)
          .end((err, res) => {
            adminUser = res.body.user;
            adminToken = res.body.token;
            documentOne.ownerId = adminUser.id;
            documentOne.access = 'private';

            request.post('/users')
              .send(regularUserParam)
              .end((err, res) => {
                regularUser = res.body.user;
                regularToken = res.body.token;
                documentTwo.ownerId = regularUser.id;
                documentTwo.access = 'public';
                done();
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

    it('Should ensure that document has an owner', (done) => {
      request.post('/documents')
        .set({ 'x-access-token': regularToken })
        .send(documentTwo)
        .expect(200)
        .end((err, res) => {
          document = res.body;
          expect(res.body.ownerId).to.equal(regularUser.id);
          done();
        });
    });

    it('Should ensure that document has a role that can access it', (done) => {
      expect(document.access).to.equal('public');
      done();
    });

    it('Should ensure that document cannot be created if title is lacking',
    (done) => {
      const nullTitleDoc = { title: null, content: 'content' };
      request.post('/documents')
        .set({ 'x-access-token': adminToken })
        .send(nullTitleDoc)
        .expect(422)
        .end((err, res) => {
          expect(res.body.message[0]).to
          .equal('title cannot be null');
          done();
        });
    });
  });

  describe('Get (/documents:id) - Get document', () => {
    it('Should return all documents with pagination', (done) => {
      request.get('/documents?limit=1&offset=1')
        .set({ 'x-access-token': adminToken })
        .expect(200).end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.documents.length).to.be.greaterThan(0);
          expect(res.body.metadata).not.be.null;
          done();
        });
    });

    it('Should return error message for invalid input', (done) => {
      request.get('/documents?limit=1&offset=asd')
        .set({ 'x-access-token': adminToken })
        .expect(400).end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to
          .equal('invalid input syntax for integer: "asd"');
          done();
        });
    });

    it('Should return a document with specified id to its owner', (done) => {
      request.get('/documents/2')
        .set({ 'x-access-token': regularToken })
        .expect(200)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.ownerId).to.equal(regularUser.id);
          expect(res.body.title).to.equal(documentTwo.title);
          done();
        });
    });

    it('Should fail to return document that does not exist', (done) => {
      request.get('/documents/123')
        .set({ 'x-access-token': adminToken })
        .expect(404)
        .end((err, res) => {
          expect(res.body.message).to.equal('Document Not Found');
          done();
        });
    });

    it('Should fail to return a document to non-permited users', (done) => {
      request.get('/documents/1')
        .set({ 'x-access-token': regularToken })
        .expect(401)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to.equal('You cannot view this document');
          done();
        });
    });
  });

  describe('PUT: (/documents/:id) - EDIT A DOCUMENT', () => {
    it('Should return error message for invalid input', (done) => {
      request.get('/documents/hello')
        .set({ 'x-access-token': adminToken })
        .expect(400).end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to
          .equal('invalid input syntax for integer: "hello"');
          done();
        });
    });

    it('Should not perform edit if invalid id is provided', (done) => {
      const newContent = { content: 'replace previous document' };
      request.put('/documents/123')
        .set({ 'x-access-token': regularToken })
        .send(newContent)
        .expect(404)
        .end((err, res) => {
          expect(res.body.message).to.equal('Document Not Found');
          done();
        });
    });

    it('Should not perform edit if User is not authorized', (done) => {
      const newContent = { content: 'replace previous document' };
      request.put('/documents/2')
        .send(newContent)
        .expect(401, done);
    });

    it('Should fail to edit document if request is not made by the owner',
    (done) => {
      const newContent = { content: 'replace previous document' };
      request.put('/documents/1')
        .set({ 'x-access-token': regularToken })
        .send(newContent)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal('You cannot update this document');
          done();
        });
    });

    it('Should edit document if valid id is provided', (done) => {
      const newContent = { content: 'replace previous document' };
      request.put('/documents/1')
        .set({ 'x-access-token': adminToken })
        .send(newContent)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.content).to.equal(newContent.content);
          done();
        });
    });
  });

  describe('Delete (/document/:id) - Delete a document', () => {
    it('Should return error message for invalid input', (done) => {
      request.get('/documents/hello')
        .set({ 'x-access-token': adminToken })
        .expect(400).end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to
          .equal('invalid input syntax for integer: "hello"');
          done();
        });
    });

    it('Should not delete if user is not authorized', (done) => {
      const newContent = { content: 'replace previous document' };
      request.delete('/documents/2')
        .send(newContent)
        .expect(401, done);
    });

    it('Should fail to delete a document if request is not made by the owner',
    (done) => {
      request.delete('/documents/1')
        .set({ 'x-access-token': regularToken })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal('You cannot delete this document');
          done();
        });
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
