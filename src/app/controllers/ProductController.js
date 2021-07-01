const Category = require('../models/Category');
const Product = require('../models/Product');
const File = require('../models/File');
const { formatPrice, date } = require('../../lib/utils');
const { unlinkSync } = require('fs');
const LoadProductService = require('../services/LoadProductService');

module.exports = {

  async create(req, res) {
    try {
      const categories = await Category.findAll();

      return res.render('products/create', { categories });

    } catch (error) {
        console.error(error);
    }
  },
  
  async post(req, res) {

    try {
      const userId = req.user;
      const fields = Object.keys(req.body);

      for (field of fields) {
        if (req.body[field] == "") {
          return res.send("Please, fill all fields");
        }
      }

      if (req.files.length == 0) {
        return res.send("Please, choose one product image at least");
      }

      let { category_id, name, description, old_price, price, quantity, status } = req.body;

      price = price.replace(/\D/g, "");
      old_price = price || old_price.replace(/\D/g, "");

      const product_id = await Product.create({
        category_id,
        user_id: userId,
        name,
        description, 
        old_price: old_price,
        price,
        quantity,
        status: status || 1
      });

      const filesPromise = req.files.map(file => File.create({ name: file.filename, path: file.path, product_id }));
      await Promise.all(filesPromise);

      return res.redirect(`/products/product/${product_id}/edit`);

    } catch (error) {
        console.error(error);
    }
    
  },

  async show(req, res) {
    
    try {
      const product = await LoadProductService.load('product', { where: { id: req.params.id } });

      return res.render("products/show", { product });

    } catch (error) {
        console.error(error);
    }

  },

  async edit(req, res) {

    try {
      const product = await LoadProductService.load('product', { where: { id: req.params.id } });

      const categories = await Category.findAll();

      return res.render('products/edit', { product, categories });

    } catch (error) {
        console.error(error);
    }

  },

  async put(req, res) {

    try {
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
      const oldProduct = await Product.findById(req.body.id);

      if (oldProduct.price != req.body.price) {
        req.body.old_price = oldProduct.price;
      } else {
          req.body.old_price = req.body.old_price.replace(/\D/g, "");
      }

      const { category_id, name, description, old_price, price, quantity, status } = req.body;

      await Product.update(req.body.id, {
        category_id,
        name,
        description,
        old_price,
        price,
        quantity,
        status
      });

      return res.redirect(`/products/product/${req.body.id}`);

    } catch (error) {
        console.error(error);
    }

  },

  async delete(req, res) {
    const product_id = req.body.id;
    
    const files = await Product.files(product_id);
    
    await Product.delete(product_id);

    files.map(file => {
      try {
        unlinkSync(file.path);

      } catch (error) {
          console.error(error);
      }
    })

    res.redirect('/products/create');
  }
  
}