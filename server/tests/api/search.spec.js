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
  let document, adminRole, regularRole, adminUser, // eslint-disable-line no-unused-vars
    regularUser, adminToken;

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
            documentOne.UserId = adminUser.id;
            documentOne.RoleId = adminRole.id;

            request.post('/users')
              .send(regularUserParam)
              .end((err, res) => {
                regularUser = res.body.user;
                documentTwo.UserId = regularUser.id;
                documentTwo.RoleId = regularRole.id;

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
    it('Should search a document by user', (done) => {
      request.get('/documents/user?UserId=1')
        .set({ 'x-access-token': adminToken })
        .expect(201)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body[0].UserId).to.equal(1);
          expect(res.body.length).to.equal(2);
          done();
        });
    });

    it('Should search a document by role that can access it', (done) => {
      request.get('/documents/role?RoleId=1')
        .set({ 'x-access-token': adminToken })
        .expect(201)
        .end((err, res) => {
          expect(typeof res.body).to.equal('object');
          expect(res.body[0].RoleId).to.equal(1);
          expect(res.body.length).to.equal(1);
          done();
        });
    });
  });
});
