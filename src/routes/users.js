const express = require('express');
const routes = express.Router();
const SessionController = require('../app/controllers/SessionController');
const UserController = require('../app/controllers/UserController');
const Validator = require('../app/validators/user');

// login/logout
// routes.get('/login', SessionController.loginForm);
// routes.post('/login', SessionController.login);
// routes.post('/logout', SessionController.logout);

// forgot/reset password
// routes.get('/forgot-password', SessionController.forgotForm);
// routes.post('/forgot-password', SessionController.forgot);
// routes.get('/password-reset', SessionController.resetForm);
// routes.post('/password-reset', SessionController.reset);

// register user
routes.get('/register', UserController.registerForm);
routes.post('/register', Validator.post, UserController.post);
routes.get('/', UserController.show);
// routes.put('/', UserController.update);
// routes.delete('/', UserController.delete);

module.exports = routes;