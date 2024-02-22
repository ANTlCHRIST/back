const db = require("../../models");
const router = require('express').Router();

router.delete('/', async (req, res) => {
    try {
        await db.session.update(
            { expired: true },
            { where: { session_id: req.ses.session_id } }
        )

        res.status(201).json({ success: true, message: "signout success" });
    } catch (error) {
        res.status({success: false, message: error.message});
    }
});

module.exports = router;