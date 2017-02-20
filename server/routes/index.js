import controller from '../controllers';
import * as auth from './auth';

const userController = controller.user;
const docController = controller.document;
const roleController = controller.role;

export default (app) => {
  app.get('/info', (req, res) => res.status(200).send({
    message: 'Welcome to Document Management System!',
  }));

  app.post('/roles', auth.verifyToken, auth.adminAccess, roleController.createRole);
  app.get('/roles', auth.verifyToken, auth.adminAccess, roleController.listRoles);
  app.get('/roles/:id', auth.verifyToken, auth.adminAccess, roleController.getRole);
  app.put('/roles/:id', auth.verifyToken, auth.adminAccess, roleController.updateRole);
  app.delete('/roles/:id', auth.verifyToken, auth.adminAccess, roleController.deleteRole);

  app.post('/users', userController.createUser);
  app.get('/users', auth.verifyToken, auth.adminAccess, userController.listUsers);
  app.get('/users/:id', auth.verifyToken, userController.getUser);
  app.get('/users/:id/documents', auth.verifyToken, userController.getUserDoc);
  app.put('/users/:id', auth.verifyToken, userController.updateUser);
  app.delete('/users/:id', auth.verifyToken, auth.adminAccess, userController.deleteUser);

  app.post('/login', userController.login);
  app.post('/logout', userController.logout);

  app.post('/documents', auth.verifyToken, docController.createDoc);
  app.get('/documents', auth.verifyToken, docController.listDocs);
  app.get('/documents/role', auth.verifyToken, auth.adminAccess, docController.getRoleDoc);
  app.get('/documents/user', auth.verifyToken, auth.adminAccess, docController.getUserDoc);
  app.get('/documents/date', auth.verifyToken, auth.adminAccess, docController.getDateDoc);
  app.get('/documents/:id', auth.verifyToken, docController.getDoc);
  app.put('/documents/:id', auth.verifyToken, docController.updateDoc);
  app.delete('/documents/:id', auth.verifyToken, docController.deleteDoc);
};
