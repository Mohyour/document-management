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
        res.status(400).send(error);
      });
  },

  listUsers(req, res) {
    return User
    .all()
    .then(user => res.status(200).send(user));
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
    });
  },

  getUserDoc(req, res) {
    return Doc
    .findAll({ where: { UserId: req.params.id } })
    .then(user => res.status(200).send(user));
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
      if (user.id !== req.decoded.UserId) {
        return res.status(404).send({
          message: 'You cannot update this user',
        });
      }
      return user
        .update(req.body)
        .then(() => res.status(200).send(user));
    });
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
          }));
      });
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
          .send({ message: 'Login Failed' });
      });
  },

  logout(req, res) {
    return res.status(200)
      .send({ message: 'Successful logout' });
  }

};
