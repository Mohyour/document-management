import model from '../models';

const Role = model.Role;

export default {

  /**
   * createRoles - Creates a role
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
  createRole(req, res) {
    return Role
      .create(req.body)
      .then(role => res.status(201).send(role))
      .catch((error) => {
        res.status(400).send({
          message: error.message,
        });
      })
      .catch((error) => {
        return res.status(400).send({
          message: error.message
        });
      });
  },

  /**
   * listRoles - List roles
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
  listRoles(req, res) {
    const limit = req.query.limit || '10';
    const offset = req.query.offset || '0';
    return Role
    .findAndCountAll({
      limit,
      offset,
      order: '"createdAt" DESC'
    })
    .then((roles) => {
      const metadata = limit && offset ? { count: roles.count,
        pages: Math.ceil(roles.count / limit),
        currentPage: Math.floor(offset / limit) + 1,
        pageSize: roles.rows.length } : null;
      res.status(200).send({ roles: roles.rows, metadata });
    })
    .catch((error) => {
      return res.status(400).send({
        message: error.message
      });
    });
  },

  /**
   * getRole - Get a role
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
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
    .catch((error) => {
      return res.status(400).send({
        message: error.message
      });
    });
  },

  /**
   * updateRole - Update a role
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
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
        });
    })
    .catch((error) => {
      return res.status(400).send({
        message: error.message
      });
    });
  },

  /**
   * deleteRole - delete a role
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
  deleteRole(req, res) {
    return Role
      .findById(req.params.id)
      .then(role => {
        if (!role) {
          return res.status(404).send({
            message: 'Role Not Found',
          });
        }
        return role
          .destroy()
          .then(() => res.status(200).send({
            message: 'Role Deleted'
          }));
      })
      .catch((error) => {
        return res.status(400).send({
          message: error.message
        });
      });
  },
};
