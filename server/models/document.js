export default (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT
    },
    ownerId: {
      type: DataTypes.INTEGER
    },
    access: {
      type: DataTypes.STRING,
      defaultValue: 'public',
      validate: {
        isIn: [['private', 'public', 'role']]
      }
    }

  }, {
    classMethods: {
      associate(models) {
        // model association
        Document.belongsTo(models.User, {
          foreignKey: 'ownerId'
        });
      }
    }
  });
  return Document;
};
