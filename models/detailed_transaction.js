module.exports = (sequelize, DataTypes) => {
  const detailed_transaction = sequelize.define("detailed_transaction", {
    detailed_transaction_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    item_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qty_stock_change: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
    },
  });

  return detailed_transaction;
};
