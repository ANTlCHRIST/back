const db = require("../../models");
const { Op } = require("sequelize");

async function get(req, res) {
  try {
    const detailed = await db.detailed_transaction.findAll({
      where: {
        createdAt: {
          [Op.between]: [req.params.startDate, req.params.endDate],
        },
      },
    });
    return res.status(500).json({ detailed });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = get;
