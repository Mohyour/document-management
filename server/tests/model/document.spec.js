/* eslint-disable no-unused-expressions */

import chai from 'chai';
import model from '../../models';
import params from '../test-helper';

const expect = chai.expect;
const documentParams = params.testDocument;
const userParams = params.regularUser;
const requiredFields = ['title', 'content', 'UserId', 'RoleId'];

describe('Document Model', () => {
  describe('How document model is created', () => {
    let document;
    let owner;
    describe('Create Role', () => {
      before((done) => {
        model.Role.create(params.adminRole)
        .then((createdRole) => {
          userParams.RoleId = createdRole.id;  // user's RoleId
          documentParams.RoleId = createdRole.id; // role that can access document
          return model.User.create(userParams);
        })
        .then((createdUser) => {
          owner = createdUser;
          documentParams.UserId = owner.id;
          done();
        });
      });

      beforeEach(() => {
        document = model.Document.build(documentParams);
      });

      afterEach(() => model.Document.destroy({ where: {} }));

      after(() => model.sequelize.sync({ force: true }));


      it('should create a document', (done) => {
        document.save()
        .then((createdDocument) => {
          expect(createdDocument).to.exist;
          expect(typeof createdDocument).to.equal('object');
          done();
        });
      });

      it('should create document with title and content', (done) => {
        document.save()
          .then((createdDocument) => {
            expect(createdDocument.title).to.equal(documentParams.title);
            expect(createdDocument.content).to.equal(documentParams.content);
            done();
          });
      });

      it('should create a document with owner', (done) => {
        document.save()
          .then((createdDocument) => {
            expect(createdDocument.UserId).to.equal(owner.id);
            done();
          });
      });

      it('should create a document with publish date', (done) => {
        document.save()
        .then((createdDocument) => {
          expect(createdDocument.createdAt).to.exist;
          done();
        });
      });

      it('should create a document with role that can access it', (done) => {
        document.save()
          .then((createdDocument) => {
            expect(createdDocument.RoleId).to.equal(1);
            done();
          });
      });

      describe('Document Model Validations', () => {
        describe('Fields Validation', () => {
          requiredFields.forEach((field) => {
            it(`requires a ${field} field to create a document`, () => {
              document[field] = null;
              return document.save()
              .catch((error) => {
                expect(/notNull Violation/.test(error.message)).to.be.true;
              });
            });
          });
        });
      });
    });
  });
});
