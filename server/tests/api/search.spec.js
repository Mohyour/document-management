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

describe('Search api (documents/)', () => {
  let document; // eslint-disable-line no-unused-vars
  let adminRole;
  let regularRole;
  let adminUser; // eslint-disable-line no-unused-vars
  let regularUser;
  let adminToken;

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
          .end((error, response) => {
            adminUser = response.body.user;
            adminToken = response.body.token;
            documentOne.ownerId = adminUser.id;
            documentOne.title = 'test title';

            request.post('/users')
              .send(regularUserParam)
              .end((err, res) => {
                regularUser = res.body.user;
                documentTwo.ownerId = regularUser.id;

                request.post('/documents')
                .set({ 'x-access-token': adminToken })
                .send(documentOne)
                .end((err, res) => {
                  document = res.body;
                  request.post('/documents')
                  .set({ 'x-access-token': adminToken })
                  .send(documentTwo)
                  .end((err, res) => {
                    document = res.body;
                    done();
                  });
                });
              });
          });
      });
  });

  after(() => model.sequelize.sync({ force: true }));

  describe('Get (/document)', () => {
    it('Should search a document for a string', (done) => {
      request.get('/documents/search?query=test&limit=1&offset=0')
        .set({ 'x-access-token': adminToken })
        .expect(201)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.documents).to.exist;
          expect(res.body.documents[0].title).to.equal('test title');
          expect(res.body.metadata).to.not.be.null;
          done();
        });
    });

    it('Should return error message for invalid input', (done) => {
      request.get('/documents/search?query=test&limit=1&offset=hello')
        .set({ 'x-access-token': adminToken })
        .expect(200).end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to
          .equal('invalid input syntax for integer: "hello"');
          done();
        });
    });

    it('Should search a document by role that can access it', (done) => {
      request.get('/documents/role?access=public&limit=1&offset=0')
        .set({ 'x-access-token': adminToken })
        .expect(201)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.documents[0].access).to.equal('public');
          expect(res.body.metadata).to.not.be.null;
          done();
        });
    });

    it('Should return error message for invalid input', (done) => {
      request.get('/documents/role?access=public&limit=1&offset=hello')
        .set({ 'x-access-token': adminToken })
        .expect(200).end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body.message).to
          .equal('invalid input syntax for integer: "hello"');
          done();
        });
    });
  });
});
