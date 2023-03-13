const { Restaurant, Category } = require('../../models')
const { getOffset, getPagination } = require('../../helpers/pagination-helper')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    const DEFAULT_LIMIT = 9

    const categoryId = Number(req.query.categoryId) || '' // 還不知 或 當空字元的原因
    // const categoryId = +req.params.categoryId || '' // 與上同意，之後查 + 的用處
    // console.log(categoryId)

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT // 前面的 Number(...)，只是留著，未來要用可用
    const offset = getOffset(limit, page)

    Promise.all([
      Restaurant.findAndCountAll({
        nest: true,
        raw: true,
        include: [Category],
        limit,
        offset,
        where: { // 這個 where 的 value，物件包物件，原來能這樣
          ...categoryId ? { categoryId } : {} // 這裡的 ...，我猜不是展開運算子，畢竟下面實驗失敗，而且，categoryId 明明就是"一個"數字，為啥要展開？
          // 結論上，這裡的 ... 還是展開運算子，只是讀取的語法關係，讓上面成功，下面失敗
          // categoryId ? { categoryId } : {}
        }
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        // (下1) fr 是 favoritedRestaurant 的縮寫
        // const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id) : []
        // const likeRestaurantsId = req.user?.LikeRestaurants ? req.user.LikeRestaurants.map(lr => lr.id) : []
        const favoritedRestaurantsId = req.user?.FavoritedRestaurants.map(fr => fr.id) || []
        const likeRestaurantsId = req.user?.LikeRestaurants.map(lr => lr.id) || []
        // (下1) 不錯，運用展開運算子跟箭頭函式，直接改 object 內容
        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          // (下1) fr 是 favoritedRestaurant 的縮寫
          // isFavorited: req.user?.FavoritedRestaurants.map(fr => fr.id).includes(r.id)
          // (上1) 效能沒那麼好，可改成 (下1)
          isFavorited: favoritedRestaurantsId.includes(r.id),
          isLiked: likeRestaurantsId.includes(r.id)
        }))
        return res.json({
          restaurants: data,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count)
        })
      })
      .catch(err => next(err))
  }
}

module.exports = restaurantController
