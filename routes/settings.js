const express = require('express');

const isAuth = require('../middleware/is-auth');
const settingsController = require('../controllers/settings');

const router = express.Router();

router.get('/categories', isAuth, settingsController.getCategories);

router.put('/add-category', isAuth, settingsController.addCategory);

router.delete('/remove-category', isAuth, settingsController.deleteCategory);


module.exports = router;
