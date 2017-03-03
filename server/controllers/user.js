import jwt from 'jsonwebtoken';
import model from '../models';

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

export default {

  /**
   * createUser - Create a user
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
  createUser(req, res) {
    return User
      .create(req.body)
      .then(user => {
        const token = jwt.sign({
          UserId: user.id,
          RoleId: user.RoleId
        }, secret, { expiresIn: '2 days' });
        user = removePassword(user);
        return res.status(201).send({ user, token });
      })
      .catch((error) => {
        res.status(400).send({
          message: error.message,
        });
      });
  },

  /**
   * listUsers - List users
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
  listUsers(req, res) {
    const limit = req.query.limit;
    const offset = req.query.offset;
    return User
    .findAndCountAll({
      attributes: ['id', 'username', 'firstname', 'lastname', 'email', 'RoleId'],
      limit: limit || null,
      offset: offset || null,
      order: '"createdAt" DESC'
    })
    .then((user) => {
      const metadata = limit && offset ? { count: user.count,
        pages: Math.ceil(user.count / limit),
        currentPage: Math.floor(offset / limit) + 1 } : null;
      res.status(200).send({ user: user.rows, metadata });
    });
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
    .then(user => {
      if (!user) {
        return res.status(404).send({
          message: 'User Not Found'
        });
      }
      res.status(200).send(user);
    });
  },

  /**
   * getUserDoc - Get documents belonging to a user
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
  getUserDoc(req, res) {
    const limit = req.query.limit;
    const offset = req.query.offset;
    return Doc
    .findAndCountAll({ where: { UserId: req.params.id },
      limit: limit || null,
      offset: offset || null,
      order: '"createdAt" DESC' })
    .then((user) => {
      const metadata = limit && offset ? { count: user.count,
        pages: Math.ceil(user.count / limit),
        currentPage: Math.floor(offset / limit) + 1 } : null;
      res.status(200).send({ user: user.rows, metadata });
    });
  },

  /**
   * updateUser - Updates a user
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
  updateUser(req, res) {
    if ((req.body.RoleId) && (req.decoded.RoleId !== 1)) {
      return res.status(403).send({
        message: 'You are not permitted to assign this user to a role',
      });
    }
    return User
    .findById(req.params.id, {})
    .then(user => {
      if (!user) {
        return res.status(404).send({
          message: 'User Not Found',
        });
      }
      if (user.id !== req.decoded.UserId) {
        return res.status(403).send({
          message: 'You cannot update this user',
        });
      }
      return user
        .update(req.body)
        .then(() => res.status(200).send(user));
    });
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
      .then(user => {
        if (!user) {
          return res.status(400).send({
            message: 'User Not Found'
          });
        }
        if (user.id === req.decoded.UserId) {
          return res.status(403).send({
            message: 'You cannot delete yourself'
          });
        }
        return user
          .destroy()
          .then(() => res.status(200).send({
            message: 'User Deleted'
          }));
      });
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
