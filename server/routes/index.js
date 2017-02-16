import controller from '../controllers';
import * as auth from './auth';

const userController = controller.user;
const docController = controller.document;
const roleController = controller.role;

export default (app) => {
  app.get('/info', (req, res) => res.status(200).send({
    message: 'Welcome to Document Management System!',
  }));

  app.post('/roles', auth.verifyToken, roleController.createRole);
  app.get('/roles', auth.verifyToken, roleController.listRoles);
  app.get('/roles/:id', roleController.getRole);
  app.put('/roles/:id', auth.verifyToken, roleController.updateRole);
  app.delete('/roles/:id', auth.verifyToken, roleController.deleteRole);

  app.post('/users', userController.createUser);
  app.get('/users', auth.verifyToken, userController.listUsers);
  app.get('/users/:id', auth.verifyToken, userController.getUser);
  app.get('/users/:id/documents', auth.verifyToken, userController.getUserDoc);
  app.put('/users/:id', auth.verifyToken, userController.updateUser);
  app.delete('/users/:id', auth.verifyToken, userController.deleteUser);

  app.post('/login', userController.login);
  app.post('/logout', userController.logout);

  app.post('/documents', docController.createDoc);
  app.get('/documents', docController.listDocs);
  app.get('/documents/:id', auth.verifyToken, docController.getDoc);
  app.put('/documents/:id', auth.verifyToken, docController.updateDoc);
  app.delete('/documents/:id', auth.verifyToken, docController.deleteDoc);
};
