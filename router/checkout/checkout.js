const db = require("../../models");
const router = require("express").Router();
const randomID = require("../../components/randomID");
const socketController = require("../../controllers/socketController");
const createTransaction = require("../../components/createPaymentMidTrans");

router.post("/", async (req, res) => {
  try {
    const { table_id, items, payment_type } = req.body;

    const cek = await db.table.findOne({
      where: { table_id: table_id },
    });
    if (!cek) throw new Error("meja tidak tersedia");

    let paymentStatus = "";
    if(payment_type === "cash") paymentStatus = "paid";
    else paymentStatus = "pending";

    await db.sequelize.sync();

    const Tid = await randomID.generateID(db.transaction);

    const t = await db.sequelize.transaction();

    try {
      let totalPrice = 0;
      let message = "";

      await db.transaction.create(
        {
          transaction_id: Tid,
          buyer_id: req.ses.user_id,
          // clerk_id: "kasir",
          table_id: table_id,
          payment_type: payment_type,
          payment_status: paymentStatus,
        },
        { transaction: t },
      );

      for (const i of items) {
        const itemInfo = await db.item.findByPk(i[0]);
        const purchased_qty = i[1];

        if (!itemInfo) throw new Error(`Item with ID ${i[0]} not found.`);

        if (purchased_qty < 1)
          throw new Error(
            `need more than 0 to increase Item qty with ID ${i[0]} not found.`,
          );

        if (itemInfo.qty - purchased_qty < 0)
          throw new Error(
            `quantity demand cannot be met by the quantity of goods available`,
          );

        totalPrice += itemInfo.price * purchased_qty;

        const Did = await randomID.generateID(db.detailed_transaction);

        await db.detailed_transaction.create(
          {
            detailed_transaction_id: Did,
            transaction_id: Tid,
            item_id: i[0],
            qty_stock_change: purchased_qty * -1,
            status: 11, //menunggu diproses == 11 // diproses == 22 // selesai == 33 // dibatalkan == 43
          },
          { transaction: t },
        );

        await db.item.update(
          { qty: db.sequelize.literal(`qty - ${purchased_qty}`) },
          { where: { item_id: i[0] }, transaction: t },
        );
      }

      let emoneyTransaction;
      if(payment_type !== "cash") emoneyTransaction = await createTransaction(Tid, totalPrice);
      
      await t.commit();

      //tell to all clerk
      socketController.emitTransaction(Tid);

      res
        .status(200)
        .json({ message: message + "transaction created successfully.", emoneyRedirectUrl: emoneyTransaction.redirectUrl });
    } catch (error) {
      await t.rollback();
      console.error("Transaction failed:", error);
      throw error;
    } finally {
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json(error.message);
  }
});

module.exports = router;
