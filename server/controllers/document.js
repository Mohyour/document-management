import model from '../models/index';

const Document = model.Document;

export default {

  /**
   * createDoc - Creates a document
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {object} Response Object
   */
  createDoc(req, res) {
    req.body.UserId = req.decoded.UserId;
    return Document
      .create(req.body)
      .then(document => res.status(201).send(document))
      .catch((error) => {
        res.status(400).send({
          message: error.message
        });
      });
  },

  /**
   * listDocs - Lists all created documents
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {Object} Response Object
   */
  listDocs(req, res) {
    return Document
    .all()
    .then(document => res.status(200).send(document));
  },

  /**
   * getDoc - Gets document by id
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {Object} Response Object
   */
  getDoc(req, res) {
    Document.findById(req.params.id)
      .then((foundDocument) => {
        if (!foundDocument) {
          return res.status(404)
          .send({
            message: 'Document Not Found'
          });
        }
        if (foundDocument.access === 'public') {
          return res.status(200)
            .send(foundDocument);
        }
        if ((foundDocument.access === 'private') &&
          (foundDocument.UserId === req.decoded.UserId)) {
          return res.status(200)
            .send(foundDocument);
        }
        if (foundDocument.access === 'role') {
          return model.User.findById(foundDocument.UserId)
            .then((documentOwner) => {
              if (documentOwner.RoleId === req.decoded.RoleId) {
                return res.status(200)
                  .send(foundDocument);
              }
              return res.status(403)
                .send({
                  message: 'You cannot view this document'
                });
            });
        }
        return res.status(403)
          .send({
            message: 'You cannot view this document'
          });
      });
  },

  /**
   * getRoleDoc - Gets document by role that can access it
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {Object} Response Object
   */
  getRoleDoc(req, res) {
    return Document
    .findAll({ where: { access: req.query.access } })
    .then(document => res.status(200).send(document));
  },

  /**
   * searchDoc - search documents
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {Object} Response Object
   */
  searchDoc(req, res) {
    const queryString = req.query.query;
    const query = {
      where: {
        $and: [{ $or: [
          { access: 'public' },
          { UserId: req.decoded.UserId }
        ] }],
      },
      limit: req.query.limit || null,
      offset: req.query.offset || null,
      order: '"createdAt" DESC'
    };

    if (queryString) {
      query.where.$and.push({ $or: [
        { title: { $like: `%${queryString}%` } },
        { content: { $like: `%${queryString}%` } }
      ] });
    }
    Document.findAndCountAll(query)
      .then((documents) => {
        const metadata = query.limit && query.offset ? { count: documents.count,
          pages: Math.ceil(documents.count / query.limit),
          currentPage: Math.floor(query.offset / query.limit) + 1 } : null;
        res.send({ documents: documents.rows, metadata });
      });
  },

  /**
   * updateDoc - Update document by id
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {Object} Response Object
   */
  updateDoc(req, res) {
    return Document
    .findById(req.params.id, {})
    .then(document => {
      if (!document) {
        return res.status(404).send({
          message: 'Document Not Found',
        });
      }
      if (document.UserId !== req.decoded.UserId) {
        return res.status(403).send({
          message: 'You cannot update this document'
        });
      }
      return document
        .update(req.body)
        .then(() => res.status(200).send(document));
    });
  },

  /**
   * deleteDoc - Delete document by id
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   * @returns {Object} Response Object
   */
  deleteDoc(req, res) {
    return Document
      .findById(req.params.id)
      .then(document => {
        if (!document) {
          return res.status(400).send({
            message: 'Document Not Found',
          });
        }
        if (document.UserId !== req.decoded.UserId) {
          return res.status(403).send({
            message: 'You cannot delete this document'
          });
        }
        return document
          .destroy()
          .then(() => res.status(200).send({
            message: 'Document Deleted'
          }));
      });
  },
};
