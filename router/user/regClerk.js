const db = require("../../models");
const router = require('express').Router();
const randomID = require('../../components/randomID');
const bcrypt = require('bcrypt');

//making guest account
router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;

        const id = await randomID.generateID(db.user);

        await db.user.create({
            user_id: id,
            username: username,
            password: await bcrypt.hash(password, 10),
            role: "clerk"
        })

        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;