var db = require("../../models");
const router = require('express').Router();

router.get('/:table_id', async (req, res) => {
    const get = await db.table.findAll({
        where: { table_id: req.params.table_id }
    });

    res.status(201).json(get);
});

module.exports = router;