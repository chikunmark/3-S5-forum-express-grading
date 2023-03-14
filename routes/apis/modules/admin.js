const express = require('express')
const router = express.Router()
const adminController = require('../../../controllers/apis/admin-controller')

router.get('/restaurants', adminController.getRestaurants) // 給餐廳列表 JSON

module.exports = router
