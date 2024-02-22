module.exports = (sequelize, DataTypes) => {
  const item = sequelize.define("item", {
    item_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    owner_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cogs: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING,
    },
  });

  return item;
};
