import controller from '../controllers';

const userController = controller.user;
const docController = controller.document;
const roleController = controller.role;

export default (app) => {
  app.get('/info', (req, res) => res.status(200).send({
    message: 'Welcome to Document Management System!',
  }));

  app.post('/roles', roleController.createRole);
  app.get('/roles', roleController.listRoles);
  app.get('/roles/:id', roleController.getRole);
  app.put('/roles/:id', roleController.updateRole);
  app.delete('/roles/:id', roleController.deleteRole);

  app.post('/users', userController.createUser);
  app.get('/users', userController.listUsers);
  app.get('/users/:id', userController.getUser);
  app.get('/users/:id/documents', userController.getUserDoc);
  app.put('/users/:id', userController.updateUser);
  app.delete('/users/:id', userController.deleteUser);


  app.post('/documents', docController.createDoc);
  app.get('/documents', docController.listDocs);
  app.get('/documents/:id', docController.getDoc);
  app.put('/documents/:id', docController.updateDoc);
  app.delete('/documents/:id', docController.deleteDoc);
};
