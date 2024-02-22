var db = require("../../models");
const router = require('express').Router();

router.get('/', async (req, res) => {
    const ses = await db.session.findAll(
        { where: { user_id: req.ses.user_id } }
    );
    return res.status(201).json(ses);
});

module.exports = router;