import controller from '../controllers';

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
};
