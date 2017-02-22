import model from '../models/index';

const Document = model.Document;

export default {
  createDoc(req, res) {
    req.body.UserId = req.decoded.UserId;
    return Document
      .create(req.body)
      .then(document => res.status(201).send(document))
      .catch((error) => {
        res.status(500).send(error);
      });
  },

  listDocs(req, res) {
    return Document
    .all()
    .then(document => res.status(200).send(document));
  },

  getDoc(req, res) {
    return Document
    .findById(req.params.id)
    .then((document) => {
      if (!document) {
        return res.status(404).send({
          message: 'Document Not Found'
        });
      }
      if (document.RoleId === req.decoded.RoleId || document.UserId === req.decoded.UserId) {
        return res.status(200).send(document);
      }
      res.status(403).send({
        message: 'You cannot view this document'
      });
    });
  },

  getRoleDoc(req, res) {
    return Document
    .findAll({ where: { RoleId: req.query.RoleId } })
    .then(document => res.status(200).send(document));
  },

  getUserDoc(req, res) {
    return Document
    .findAll({ where: { UserId: req.query.UserId } })
    .then(document => res.status(200).send(document));
  },

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
