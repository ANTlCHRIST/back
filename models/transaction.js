module.exports = (sequelize, DataTypes) => {
  const transaction = sequelize.define("transaction", {
    transaction_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    payment_type: {
      type: DataTypes.STRING,
    },
    payment_status: {
      type: DataTypes.STRING,
    },
    payment_guarantee: {
      type: DataTypes.STRING,
    },
    buyer_id: {
      type: DataTypes.STRING,
    },
    clerk_id: {
      type: DataTypes.STRING,
    },
    table_id: {
      type: DataTypes.STRING,
    },
  });

  return transaction;
};
