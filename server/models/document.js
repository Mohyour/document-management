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
        // associations can be defined here
        Document.belongsTo(models.User, {
          foreignkey: { allowNull: true },
          onDelete: 'CASCADE'
        });
        Document.belongsTo(models.Role, {
          foreignkey: { allowNull: true },
          onDelete: 'CASCADE'
        });
      }
    }
  });
  return Document;
};
