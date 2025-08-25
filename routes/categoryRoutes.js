const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { auth } = require('../middlewares/auth');

router.get('/', categoryController.getCategories);
router.post('/', auth, categoryController.addCategory);

module.exports = router;