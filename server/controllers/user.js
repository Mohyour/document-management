import model from '../models';

const User = model.User;

export default {
  createUser(req, res) {
    return User
      .create(req.body)
      .then(user => {
        return res.status(201).send(user);
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  },

  listUsers(req, res) {
    return User
    .all()
    .then(user => res.status(200).send(user))
    .catch(error => res.status(400).send(error));
  },

  getUser(req, res) {
    return User
    .findById(req.params.id)
    .then(user => {
      if (!user) {
        return res.status(404).send({
          message: 'User Not Found'
        });
      }
      res.status(200).send(user);
    })
    .catch(error => {
      res.status(400).send(error);
    });
  },

  updateUser(req, res) {
    return User
    .findById(req.params.id, {})
    .then(user => {
      if (!user) {
        return res.status(404).send({
          message: 'User Not Found',
        });
      }
      return user
        .update(req.body)
        .then(() => res.status(200).send(user))
        .catch((error) => res.status(400).send(error));
    })
    .catch((error) => res.status(400).send(error));
  },

  deleteUser(req, res) {
    return User
      .findById(req.params.id)
      .then(user => {
        if (!user) {
          return res.status(400).send({
            message: 'User Not Found',
          });
        }
        return user
          .destroy()
          .then(() => res.status(200).send({
            message: 'User Deleted'
          }))
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },

};
