const Cart = require('../../lib/cart');
const LoadProductService = require('../services/LoadProductService');

module.exports = {

  async index(req, res) {

    try {
      let { cart } = req.session;

      // gerenciador de carrinho
      cart = Cart.init(cart);

      return res.render("cart/index", { cart });

    } catch (error) {
        console.error(error);
    }
    
  },

  async addOne(req, res) {
    // pegar o id do produto e o produto
    const { id } = req.params;
    const product = await LoadProductService.load('product', { where: { id } });

    // pegar o carrinho da sessão
    let { cart } = req.session;

    // adicionar o produto ao carrinho (usando o gerenciador de carrinho)
    cart = Cart.init(cart).addOne(product);

    // atualizar o carrinho da sessão 
    req.session.cart = cart;

    // redirecionar o usuário para a tela do carrinho
    return res.redirect('/cart');
  },

  removeOne(req, res) {
    // pegar o id do produto e o carrinho da sessão
    let { id } = req.params;
    let { cart } = req.session;

    // verificar se existe um carrinho
    if (!cart) {
      return res.redirect('/cart');
    }

    // iniciar o carrinho (gerenciador de carrinho) e remover
    cart = Cart.init(cart).removeOne(id);

    // atualizar o carrinho da sessão, removendo 1 item 
    req.session.cart = cart;

    // redirecionar para a página cart
    return res.redirect('/cart');
  },

  delete(req, res) {
    const { id } = req.params;
    const { cart } = req.session;

    if (!cart) {
      return res.redirect('/cart');
    }

    req.session.cart = Cart.init(cart).delete(id);

    return res.redirect('/cart');
  }

}