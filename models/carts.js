module.exports = (sequelize, DataTypes) => {
  const transaction = sequelize.define("transaction", {
    primaryKey: false,
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    item_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return transaction;
};
