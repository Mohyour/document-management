export default (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    classMethods: {
      associate(models) {
        // model association
        Role.hasMany(models.User, {
          foreignkey: 'id'
        });
      }
    }
  });
  return Role;
};
