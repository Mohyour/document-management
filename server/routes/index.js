import controller from '../controllers';
import * as auth from './auth';

const userController = controller.user;
const docController = controller.document;
const roleController = controller.role;

export default (app) => {
  app.get('/', (req, res) => res.status(200).send({
    message: 'Welcome to Document Management System!',
  }));

  app.route('/roles')
    .post(auth.verifyToken, auth.adminAccess, roleController.createRole)
    .get(auth.verifyToken, auth.adminAccess, roleController.listRoles);

  app.route('/roles/:id')
    .get(auth.verifyToken, auth.adminAccess, roleController.getRole)
    .put(auth.verifyToken, auth.adminAccess, roleController.updateRole)
    .delete(auth.verifyToken, auth.adminAccess, roleController.deleteRole);

  app.route('/users')
    .post(userController.createUser)
    .get(auth.verifyToken, auth.adminAccess, userController.listUsers);

  app.route('/users/:id')
    .get(auth.verifyToken, auth.adminAccess, userController.getUser)
    .put(auth.verifyToken, userController.updateUser)
    .delete(auth.verifyToken, auth.adminAccess, userController.deleteUser);

  app.get('/users/:id/documents', auth.verifyToken, auth.adminAccess, userController.getUserDoc);

  app.post('/login', userController.login);
  app.post('/logout', userController.logout);

  app.route('/documents')
    .post(auth.verifyToken, docController.createDoc)
    .get(auth.verifyToken, auth.adminAccess, docController.listDocs);

  app.get('/documents/role', auth.verifyToken, auth.adminAccess, docController.getRoleDoc);
  app.get('/documents/search', auth.verifyToken, docController.searchDoc);

  app.route('/documents/:id')
    .get(auth.verifyToken, docController.getDoc)
    .put(auth.verifyToken, docController.updateDoc)
    .delete(auth.verifyToken, docController.deleteDoc);
};
