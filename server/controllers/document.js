import model from '../models/index';

const Document = model.Document;

export default {
  createDoc(req, res) {
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
    .then(document => res.status(200).send(document))
    .catch((error) => {
      res.status(500).send(error);
    });
  },

  getDoc(req, res) {
    return Document
    .findById(req.params.id)
    .then(document => res.status(200).send(document))
    .catch(error => res.status(400).send(error));
  },

  getRoleDoc(req, res) {
    return Document
    .findAll({ where: { RoleId: req.query.RoleId } })
    .then(document => res.status(200).send(document))
    .catch(error => res.status(400).send(error));
  },

  getUserDoc(req, res) {
    return Document
    .findAll({ where: { UserId: req.query.UserId } })
    .then(document => res.status(200).send(document))
    .catch(error => res.status(400).send(error));
  },


  getDateDoc(req, res) {
    return Document
    .findAll({ where: { createdAt: { $contain: req.query.date } } })
    .then(document => res.status(200).send(document))
    .catch(error => res.status(400).send(error));
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
      return document
        .update(req.body)
        .then(() => res.status(200).send(document))
        .catch((error) => res.status(400).send(error));
    })
    .catch((error) => res.status(400).send(error));
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
        return document
          .destroy()
          .then(() => res.status(200).send({
            message: 'Document Deleted'
          }))
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },
};
