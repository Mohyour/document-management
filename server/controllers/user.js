import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import model from '../models';

dotenv.config();

const User = model.User;
const Doc = model.Document;

const secret = process.env.SECRET_TOKEN || 'secret';

const removePassword = (user) => {
  const attributes = {
    id: user.id,
    username: user.username,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    RoleId: user.RoleId
  };
  return attributes;
};

const errorHandler = errors => errors.map(error => error.message);

export default {

  /**
   * createUser - Create a user
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
  createUser(req, res) {
    if (req.body.RoleId === '1') {
      return res.status(401).send({
        message: 'You cannot register as an admin user'
      });
    }
    return User
      .create(req.body)
      .then((user) => {
        const token = jwt.sign({
          UserId: user.id,
          RoleId: user.RoleId
        }, secret, { expiresIn: '2 days' });
        user = removePassword(user);
        return res.status(201).send({ user, token });
      })
      .catch(error => res.status(400).send({
        message: errorHandler(error.errors)
      }));
  },

  /**
   * listUsers - List users
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
  listUsers(req, res) {
    const limit = req.query.limit || '10';
    const offset = req.query.offset || '0';
    return User
    .findAndCountAll({
      attributes: ['id', 'username', 'firstname',
        'lastname', 'email', 'RoleId'],
      limit,
      offset,
      order: '"createdAt" DESC'
    })
    .then((users) => {
      const metadata = limit && offset ? { totalCount: users.count,
        pages: Math.ceil(users.count / limit),
        currentPage: Math.floor(offset / limit) + 1,
        pageSize: users.rows.length } : null;
      res.status(200).send({ users: users.rows, metadata });
    })
    .catch(error => res.status(400).send({
      message: errorHandler(error.errors)
    }));
  },

  /**
   * getUser - Get a user
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
  getUser(req, res) {
    return User
    .findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: 'User Not Found'
        });
      }
      user = removePassword(user);
      res.status(200).send(user);
    })
    .catch(error => res.status(400).send({
      message: error.message
    }));
  },

  /**
   * getUserDoc - Get documents belonging to a user
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
  getUserDoc(req, res) {
    const limit = req.query.limit || '10';
    const offset = req.query.offset || '0';
    return Doc
    .findAndCountAll({ where: { ownerId: req.params.id },
      limit,
      offset,
      order: '"createdAt" DESC' })
    .then((documents) => {
      const metadata = limit && offset ? { count: documents.count,
        pages: Math.ceil(documents.count / limit),
        currentPage: Math.floor(offset / limit) + 1,
        pageSize: documents.rows.length } : null;
      res.status(200).send({ documents: documents.rows, metadata });
    })
    .catch(error => res.status(400).send({
      message: error.message
    }));
  },

  /**
   * updateUser - Updates a user
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
  updateUser(req, res) {
    if ((req.body.RoleId) && (req.decoded.RoleId !== 1)) {
      return res.status(401).send({
        message: 'You are not permitted to assign this user to a role',
      });
    }
    return User
    .findById(req.params.id, {})
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: 'User Not Found',
        });
      }
      if (user.id !== req.decoded.UserId) {
        return res.status(401).send({
          message: 'You cannot update this user',
        });
      }
      return user
        .update(req.body)
        .then(() => res.status(200).send(removePassword(user)));
    })
    .catch(error => res.status(400).send({
      message: error.message
    }));
  },

  /**
   * deleteUser - Deletes a user
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
  deleteUser(req, res) {
    return User
      .findById(req.params.id)
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: 'User Not Found'
          });
        }
        if (user.id === req.decoded.UserId) {
          return res.status(401).send({
            message: 'You cannot delete yourself'
          });
        }
        return user
          .destroy()
          .then(() => res.status(200).send({
            message: 'User Deleted'
          }));
      })
      .catch(error => res.status(400).send({
        message: error.message
      }));
  },

  /**
   * login - Logs in a user
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
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

  /**
   * logout - Logs out a user
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
  logout(req, res) {
    return res.status(200)
      .send({ message: 'Successful logout' });
  }

};
