const db = require("../../models");
const router = require('express').Router();
const randomID = require('../../components/randomID');

router.put('/', async (req, res) => {
    try {
        const { items } = req.body;

        await db.sequelize.sync();

        const Tid = await randomID.generateID(db.transaction);

        const t = await db.sequelize.transaction();

        try {
            let totalPrice = 0;

            await db.transaction.create({
                transaction_id: Tid,
                clerk_id: req.ses.user_id,
            }, { transaction: t });

            for (const i of items) {
                const itemInfo = await db.item.findByPk(i[0]);

                const increase_qty = i[1];

                if (!itemInfo) throw new Error(`Item with ID ${i[0]} not found.`);

                if(increase_qty < 1) throw new Error(`need more than 0 to increase Item qty with ID ${i[0]} not found.`);
                
                totalPrice += itemInfo.price * increase_qty;

                const Did = await randomID.generateID(db.detailed_transaction);

                await db.detailed_transaction.create({
                    detailed_transaction_id: Did,
                    transaction_id: Tid,
                    item_id: i[0],
                    qty_stock_change: increase_qty,
                }, { transaction: t });

                await db.item.update(
                    { qty: db.sequelize.literal(`qty + ${increase_qty}`) },
                    { where: { item_id: i[0] }, transaction: t }
                );
            }

            await db.user.update(
                { balance: db.sequelize.literal(`balance - ${totalPrice}`) },
                { where: { user_id: req.ses.user_id }, transaction: t }
            );

            await t.commit();
            res.status(200).json({ message: "transaction created successfully." });

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