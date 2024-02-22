var db = require("../../models");
const router = require('express').Router();

router.get('/', async (req, res) => {
    const cek = await db.table.findAll();

    if (!cek) {
        return res.status(401);
    }

    res.status(201).json(cek);
});

module.exports = router;