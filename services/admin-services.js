const { Restaurant, Category } = require('../models')

const adminServices = {
  // getRestaurants: (req, res, next, cb) => {
  getRestaurants: cb => {
    return Restaurant.findAll({ raw: true, nest: true, include: [Category] })
    // (上1) 因為接下來沒有要對找到的資料進行 CRUD，所以用 {raw: true} 把他們轉成 JS object，準備渲染
      .then(restaurants => cb(null, { restaurants }))
      .catch(err => cb(err))
  },
  deleteRestaurant: (req, cb) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.destroy()
      })
      .then(deletedRestaurant => cb(null, { restaurant: deletedRestaurant }))
      .catch(err => cb(err))
  }
}

module.exports = adminServices
