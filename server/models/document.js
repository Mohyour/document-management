export default (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    content: {
      type: DataTypes.TEXT
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
          foreignkey: { allowNull: true }
        });
      }
    }
  });
  return Document;
};
