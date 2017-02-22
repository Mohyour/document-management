export default (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    content: {
      type: DataTypes.TEXT
    }
  }, {
    classMethods: {
      associate(models) {
        // model association
        Document.belongsTo(models.User, {
          foreignkey: { allowNull: true }
        });
        Document.belongsTo(models.Role, {
          foreignkey: { allowNull: true }
        });
      }
    }
  });
  return Document;
};
