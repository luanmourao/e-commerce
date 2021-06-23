const express = require('express');
const routes = express.Router();
const multer = require('../app/middlewares/multer'); 
const ProductController = require('../app/controllers/ProductController');
const SearchController = require('../app/controllers/SearchController');
const { onlyUsers } = require('../app/middlewares/session');

routes.get('/create', onlyUsers, ProductController.create);
routes.get('/:id', ProductController.show);
routes.post('/', onlyUsers, multer.array("photos", 6), ProductController.post);
routes.get('/:id/edit', onlyUsers, ProductController.edit);
routes.put('/', onlyUsers, multer.array("photos", 6), ProductController.put);
routes.delete('/', onlyUsers, ProductController.delete);
routes.get('/search', SearchController.index);

module.exports = routes;