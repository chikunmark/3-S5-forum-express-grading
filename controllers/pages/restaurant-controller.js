const { Restaurant, Category, Comment, User } = require('../../models')
// const { getOffset, getPagination } = require('../../helpers/pagination-helper')
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    // (下段) 實驗，測試 eager loading 效果
    // Restaurant.findOne({
    //   where: { name: "Rochelle O'Conner" },
    //   include: [
    //     Category,
    //     { model: Comment, include: User }
    //     (上1) 看這裡是根據搜尋結果，還是搜尋條件 (where...) 去做 eager loading 的，結論 --> 用搜尋結果做
    //   ]
    // }).then(shop => console.log(shop))

    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' }, // 新增這行 (與 getRestaurants 用法不同)
        { model: User, as: 'LikedUsers' } // 新增這行 (與 getRestaurants 用法不同)
      ] // 拿出關聯的 Category model
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        // (下1) f 是 favoritedUser
        const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        // (下1) l 是 LikedUser
        const isLiked = restaurant.LikedUsers.some(l => l.id === req.user.id)
        restaurant.increment('viewCounts', { by: 1 }) //! 教案方法，聰明很多，記下來
        // restaurant.update({ viewCounts: restaurant.viewCounts++ }) // 我的方法，土法煉鋼
        restaurant = restaurant.toJSON()
        return res.render('restaurant', { restaurant, isFavorited, isLiked })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category,
      nest: true,
      raw: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return res.render('dashboard', { restaurant })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        res.render('feeds', {
          restaurants,
          comments
        })
      })
      .catch(err => next(err))
  },
  // 可用，但 test 檔不給過，改
  // getTopRestaurants: (req, res, next) => {
  //   return Restaurant.findAll({
  //     // where: { [Op.gt]: 0 }, // 設定收藏數至少大於 0 的事以後再說
  //     order: [['favoritedCount', 'DESC'], ['name', 'ASC']],
  //     limit: 10,
  //     raw: true,
  //     nest: true
  //     // include: { model: User, as: 'FavoritedUsers' }

  //   })
  //     .then(restaurants => {
  //       // (下1) frIDs 是 favorited restaurant IDs 的縮寫
  //       const favoritedRestaurantsId = req.user?.FavoritedRestaurants.map(fr => fr.id)
  //       const data = restaurants.map(r => ({
  //         ...r,
  //         // isFavorited: favoritedRestaurantsId.includes(r.id)
  //         isFavorited: favoritedRestaurantsId.some(frID => frID === r.id)
  //       }))
  //       return data
  //     })
  //     .then(restaurants => res.render('top-restaurants', { restaurants }))
  //     .catch(err => next(err))
  // }
  getTopRestaurants: (req, res, next) => {
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }]
    })
      .then(restaurants => {
        restaurants = restaurants.map(restaurant => ({
          ...restaurant.toJSON(),
          // description: restaurant.description.substring(0, 50),
          favoritedCount: restaurant.FavoritedUsers.length,
          // (下1) fr 代表 favorite restaurant
          isFavorited: req.user?.FavoritedRestaurants.some(fr => fr.id === restaurant.id)
        }))
          .sort((a, b) => b.favoritedCount - a.favoritedCount)
          .slice(0, 10)
        res.render('top-restaurants', { restaurants })
      })
      .catch(err => next(err))
  }

}
module.exports = restaurantController
