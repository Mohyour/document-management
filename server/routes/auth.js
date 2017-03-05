import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import model from '../models';

dotenv.config();

const secret = process.env.SECRET_TOKEN;

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization || req.headers['x-access-token'];
  if (!token) {
    return res.status(401)
      .json({ message: 'Not Authorized' });
  }

  jwt.verify(token, secret, (error, decoded) => {
    if (error) {
      return res.status(406)
        .send({ message: 'Token Invalid' });
    }

    req.decoded = decoded;
    next();
  });
};

const adminAccess = (req, res, next) => {
  const roleId = req.decoded.RoleId;
  model.Role.findById(roleId)
    .then((foundRole) => {
      if (foundRole.title.toLowerCase() === 'admin') {
        next();
      } else {
        return res.status(403)
          .json({ message: 'Only an admin is authorized for this request' });
      }
    });
};

export {
  verifyToken,
  adminAccess
};
