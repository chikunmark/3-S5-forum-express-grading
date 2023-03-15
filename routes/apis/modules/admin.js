const express = require('express')
const router = express.Router()
const adminController = require('../../../controllers/apis/admin-controller')

router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.get('/restaurants', adminController.getRestaurants) // 給餐廳列表 JSON

module.exports = router
