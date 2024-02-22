const db = require("../../models");

async function deleteAll(req, res) {
  try {
    // Delete all records from the transaction and detailed_transaction tables
    await db.transaction.destroy({ truncate: true });
    await db.detailed_transaction.destroy({ truncate: true });

    return res
      .status(200)
      .json({ message: "All transactions deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = deleteAll;
