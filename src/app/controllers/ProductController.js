const Category = require('../models/Category');
const Product = require('../models/Product');

module.exports = {

  create(req, res) {
    
    Category.all()
      .then(function(results) {
        const categories = results.rows;

        return res.render('products/create.njk', { categories });
      }).catch(function(err) {
          throw new Error(err);
      });

  },
  
  async post(req, res) {
    const fields = Object.keys(req.body);

    for (field of fields) {
      if (req.body[field] == "") {
        return res.send("Please, fill all fields");
      }
    }

    let results = await Product.create(req.body);
    const productId = results.rows[0].id;

    results = await Category.all();
    const categories = results.rows;

    return res.render('products/create.njk', { productId, categories });
  }
}