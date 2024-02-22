const db = require("../../models");
const router = require('express').Router();
const bcrypt = require('bcrypt');

//updating guest account
router.put('/', async (req, res) => {
    try {
        const { username, password, old_password } = req.body;
        const updateFields = {};

        // Check if username is not null and add it to the updateFields
        if (username !== undefined) {
            updateFields.username = username;
        }

        // Check if password is not null and add it to the updateFields
        if (password !== undefined) {
            if(old_password !== undefined){
                const passwordMatch = await bcrypt.compare(old_password, req.ses.user.password);
    
                if (!passwordMatch) throw new Error('password lama salah');
            }

            updateFields.password = await bcrypt.hash(password, 10);
        }

        // Update the user in the database only with non-null fields
        await db.user.update(updateFields, { where: { user_id: req.ses.user_id } });

        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;