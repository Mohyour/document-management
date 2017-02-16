import jwt from 'jsonwebtoken';
import model from '../models';

const User = model.User;
const Doc = model.Document;

const secret = process.env.SECRET_TOKEN || 'secret';

export default {
  createUser(req, res) {
    return User
      .create(req.body)
      .then(user => {
        const token = jwt.sign({
          UserId: user.id,
          RoleId: user.RoleId
        }, secret, { expiresIn: '2 days' });
        return res.status(201).send({ user, token });
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

  getUserDoc(req, res) {
    return Doc
    .findAll({ where: { UserId: req.params.id } })
    .then(user => res.status(200).send(user))
    .catch(error => res.status(400).send(error));
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

  login(req, res) {
    User.findOne({ where: { username: req.body.username } })
      .then((foundUser) => {
        if (foundUser && foundUser.validPassword(req.body.password)) {
          const token = jwt.sign({
            UserId: foundUser.id,
            RoleId: foundUser.RoleId
          }, secret, { expiresIn: '2 days' });
          return res.status(200)
            .send({ token, expiresIn: '2 days' });
        }
        return res.status(401)
          .send({ message: 'Log in Failed' });
      });
  },

  logout(req, res) {
    return res.status(200)
      .send({ message: 'Successful logout' });
  }

};
