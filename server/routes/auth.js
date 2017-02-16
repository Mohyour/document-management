import jwt from 'jsonwebtoken';


const secret = process.env.SECRET_TOKEN || 'secret';

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization || req.headers['x-access-token'];
  if (!token) {
    return res.status(401)
      .send({ message: 'Not Authorized' });
  }

  jwt.verify(token, secret, (error, decoded) => {
    if (error) {
      return res.status(401)
        .send({ message: 'Token Invalid' });
    }

    req.decoded = decoded;
    next();
  });
};

export default verifyToken;
