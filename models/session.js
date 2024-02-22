module.exports = (sequelize, DataTypes) => {
  const session = sequelize.define('session', {
    session_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.STRING,
    },
    expired: {
      type: DataTypes.BOOLEAN,
    },
  });
  
  return session;
};
