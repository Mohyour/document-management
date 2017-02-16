import model from '../models';

const Role = model.Role;

export default {
  createRole(req, res) {
    return Role
      .create(req.body)
      .then(role => res.status(201).send(role))
      .catch((error) => {
        res.status(500).send(error);
      });
  },

  listRoles(req, res) {
    return Role
    .all()
    .then(role => res.status(200).send(role))
    .catch(error => res.status(400).send(error));
  },

  getRole(req, res) {
    return Role
    .findById(req.params.id)
    .then(role => {
      if (!role) {
        return res.status(404).send({
          message: 'Role Not Found'
        });
      }
      res.status(200).send(role);
    })
    .catch(error => {
      res.status(400).send(error);
    });
  },

  updateRole(req, res) {
    return Role
    .findById(req.params.id, {})
    .then(role => {
      if (!role) {
        return res.status(404).send({
          message: 'Role Not Found',
        });
      }
      return role
        .update(req.body)
        .then(() => {
          res.status(200).send(role);
        })
        .catch((error) => res.status(400).send(error));
    })
    .catch((error) => res.status(400).send(error));
  },

  deleteRole(req, res) {
    return Role
      .findById(req.params.id)
      .then(role => {
        if (!role) {
          return res.status(400).send({
            message: 'Role Not Found',
          });
        }
        return role
          .destroy()
          .then(() => res.status(200).send({
            message: 'Role Deleted'
          }))
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },
};
