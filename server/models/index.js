import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Sequelize from 'sequelize';
import * as dbConfig from '../../config/config.json';

dotenv.config();

const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];
const db = {};

const sequelize = new Sequelize(process.env[config.use_env_variable], config);

fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
