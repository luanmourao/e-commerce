const express = require('express');
const routes = express.Router();
const multer = require('../app/middlewares/multer'); 
const ProductController = require('../app/controllers/ProductController');
const SearchController = require('../app/controllers/SearchController');

routes.get('/create', ProductController.create);
routes.get('/:id', ProductController.show);
routes.post('/', multer.array("photos", 6), ProductController.post);
routes.get('/:id/edit', ProductController.edit);
routes.put('/', multer.array("photos", 6), ProductController.put);
routes.delete('/', ProductController.delete);
routes.get('/search', SearchController.index);

module.exports = routes;