"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

const { item, detailed_transaction, transaction, session, user, table } = db;

transaction.hasMany(detailed_transaction, { foreignKey: "transaction_id" });
// detailed_transaction.belongsTo(transaction, { foreignKey: 'transaction_id' });

item.hasMany(detailed_transaction, { foreignKey: "item_id" });
// detailed_transaction.belongsTo(item, { foreignKey: 'item_id' });

detailed_transaction.belongsTo(transaction, {
  foreignKey: "transaction_id",
  targetKey: "transaction_id",
});
detailed_transaction.belongsTo(item, {
  foreignKey: "item_id",
  targetKey: "item_id",
});

session.belongsTo(user, { foreignKey: "user_id" });

transaction.belongsTo(table, { foreignKey: "table_id" });
table.hasMany(transaction, { foreignKey: "table_id" });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
