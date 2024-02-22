const db = require("../../models");
const { Op } = require("sequelize");

async function get(req, res) {
  try {
    const items = await db.transaction.findAll({
      where: {
        createdAt: {
          [Op.between]: [req.params.startDate, req.params.endDate],
        },
      },
    });
    return res.status(200).json(items);
  } catch (error) {
    console.error("Error while fetching items:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = get;
