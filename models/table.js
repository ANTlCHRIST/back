module.exports = (sequelize, DataTypes) => {
  const table = sequelize.define('table', {
    table_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    no_table: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    xpos: {
      type: DataTypes.INTEGER,
    },
    ypos: {
      type: DataTypes.INTEGER,
    },
  });
  
  return table;
};
