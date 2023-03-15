const adminServices = require('../../services/admin-services')

const adminController = {
  getRestaurants: (req, res, next) => {
    // adminServices.getRestaurants((req, res, next, (err, data) => err ? next(err) : res.json(data)))
    adminServices.getRestaurants((err, data) => err ? next(err) : res.json({ status: 'success', data }))
    // return Restaurant.findAll({ raw: true, nest: true, include: [Category] })
    // // (上1) 因為接下來沒有要對找到的資料進行 CRUD，所以用 {raw: true} 把他們轉成 JS object，準備渲染
    //   .then(restaurants => res.render('admin/restaurants', { restaurants }))
    //   .catch(err => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    adminServices.deleteRestaurant(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = adminController
