/* eslint-disable no-underscore-dangle, no-unused-expressions */
import chai from 'chai';
import httpMocks from 'node-mocks-http';
import sinon from 'sinon';
import events from 'events';
import supertest from 'supertest';
import app from '../../../server';
import model from '../../models';
import * as auth from '../../routes/auth';
import helper from '../test-helper';

const expect = chai.expect;
const request = supertest.agent(app);

const adminRoleParam = helper.adminRole;
const regularRoleParam = helper.regularRole;
const adminUserParam = helper.adminUser;
const regularUserParam = helper.regularUser;

const responseEvent = () => {
  return httpMocks.createResponse({ eventEmitter: events.EventEmitter });
};

describe('test for middleware', () => {
  let adminRole, regularRole, regularToken, adminToken;

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
            adminToken = res.body.token;

            request.post('/users')
              .send(regularUserParam)
              .end((err, res) => {
                regularToken = res.body.token;
                done();
              });
          });
      });
  });
  after(() => model.sequelize.sync({ force: true }));

  it('should return an error if no token is passed', (done) => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/users',
    });
    const res = responseEvent();
    res.on('end', () => {
      expect(res._getData().message).to.equal('Not Authorized');
      done();
    });
    auth.verifyToken(req, res);
  });

  it('should return error if invalid token is passed', (done) => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/users',
      headers: { 'x-access-token': 'invalid token' }
    });
    const res = responseEvent();

    res.on('end', () => {
      expect(res._getData().message).to.equal('Token Invalid');
      done();
    });
    auth.verifyToken(req, res);
  });

  it('should call next for valid token', () => {
    const stub = {
      next: () => {}
    };
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/roles',
      headers: { 'x-access-token': regularToken }
    });
    const res = responseEvent();

    sinon.spy(stub, 'next');
    res.on('end', () => {
      expect(stub.next).not.to.have.been.called;
    });
    auth.verifyToken(req, res, stub.next);
  });

  describe('IsAdmin Suite', () => {
    it('should return error for requests from by non admin for protected routes', (done) => {
      const res = responseEvent();
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/users/',
        headers: { authorization: regularToken },
        decoded: { RoleId: 2 }
      });

      res.on('end', () => {
        expect(res._getData().message).to.equal('Only an admin is authorized for this request');
        done();
      });
      auth.adminAccess(req, res);
    });

    it('should call next for admin user', () => {
      const stub = {
        next: () => {}
      };
      const res = responseEvent();
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/users/',
        headers: { authorization: adminToken },
        decoded: { RoleId: 1 }
      });

      sinon.spy(stub, 'next');

      res.on('end', () => {
        expect(stub.next).to.have.been.called;
      });
      auth.adminAccess(req, res, stub.next);
    });
  });
});
