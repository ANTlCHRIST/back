const db = require("../../models");
const router = require('express').Router();
const randomID = require('../../components/randomID');

router.put('/', async (req, res) => {
    try {
        const { table_id, no_table, xpos, ypos } = req.body;

        const cek = await db.table.findOne({
            where: { table_id: table_id }
        });
        if (!cek) throw new Error('nomor meja tidak ada');

        await db.table.update({
            no_table: no_table,
            xpos: xpos,
            ypos: ypos,
        }, {where: {table_id: table_id}})

        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;