const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.json({ status: 'success', data })) // 加個 status，可讓前端多個標準的判斷方式 (status: error/success)
  }
}

module.exports = restaurantController
