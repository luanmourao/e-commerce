const { formatPrice } = require('../../lib/utils');
const Category = require('../models/Category');
const Product = require('../models/Product');
const File = require('../models/File');

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

    if (req.files.length == 0) {
      return res.send("Please, choose one product image at least");
    }

    let results = await Product.create(req.body);
    const productId = results.rows[0].id;

    const filesPromise = req.files.map(file => File.create(file.filename, file.path, productId));
    await Promise.all(filesPromise);

    return res.redirect(`/products/${productId}/edit`);
  },

  async edit(req, res) {
    let results = await Product.find(req.params.id);
    const product = results.rows[0];

    if (!product) {
      return res.send("Product not found");
    }

    product.price = formatPrice(product.price);
    product.old_price = formatPrice(product.old_price);

    // getting categories
    results = await Category.all();
    const categories = results.rows;

    // getting images
    results = await Product.files(product.id);
    let files = results.rows;
    files = files.map(file => ({
      ...file,
      src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
    }));

    return res.render('products/edit.njk', { product, categories, files });
  },

  async put(req, res) {
    const fields = Object.keys(req.body);

    for (field of fields) {
      if (req.body[field] == "" && field != "removed_files") {
        return res.send("Please, fill all fields");
      }
    }

    if (req.files.length != 0) {
      const newFilesPromise = req.files.map(file => File.create(file.filename, file.path, req.body.id));
      await Promise.all(newFilesPromise);
    }

    if (req.body.removed_files) {
      // "1, 2, 3,"
      const removedFiles = req.body.removed_files.split(","); // [1, 2, 3,]
      const lastIndex = removedFiles.length - 1;
      removedFiles.splice(lastIndex, 1); // [1, 2, 3]

      const removedFilesPromise = removedFiles.map(id => File.delete(id));
      await Promise.all(removedFilesPromise);
    }

    req.body.price = req.body.price.replace(/\D/g, "");

    if (req.body.old_price != req.body.price) {
      const oldProduct = await Product.find(req.body.id);
      req.body.old_price = oldProduct.rows[0].price;
    }

    await Product.update(req.body);

    return res.redirect(`/products/${req.body.id}/edit`);
  },

  async delete(req, res) {
    
    await Product.delete(req.body.id);

    res.redirect('/products/create');
  }
  
}