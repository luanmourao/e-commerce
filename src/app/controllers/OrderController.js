const User = require('../models/User');
const Order = require('../models/Order');
const LoadProductService = require('../services/LoadProductService');
const LoadOrderService = require('../services/LoadOrderService');
const mailer = require('../../config/mailer');
const Cart = require('../../lib/cart');

const emailMessage = (seller, product, buyer) => 
  `
  <h2>Olá, ${seller.name}!</h2>
  <p>Você tem um novo pedido de compra do seu produto</p>
  <p>Produto: ${product.name}</p>
  <p>Preço: ${product.formattedPrice}</p>
  <br>
  <h3>Dados do comprador</h3>
  <p>${buyer.name}</p>
  <p>${buyer.email}</p>
  <p>${buyer.address}</p>
  <p>${buyer.cep}</p>
  <br>
  <p><strong>Entre em contato com o comprador para finalizar sua venda!</strong></p>
  <br><br>
  <p>Atenciosamente,</p>
  <p style="font-weight: bold; color: #182E59; display: inline; border-bottom: 2px solid #F27C38">Equipe <span style="font-weight: bold; color: #F27C38">|</span> myE-Commerce</p>
  `
;

module.exports = {

  async index(req, res) {

    try {
      // busca os pedidos em que o usuário é o comprador
      const orders = await LoadOrderService.load('orders', { where: { buyer_id: req.session.userId } });  

      return res.render("orders/index", { orders });
      
    } catch (error) {
        console.error(error);

        return res.render('orders/error');
    }
  },

  async sales(req, res) {

    try {
      // busca os pedidos em que o usuário é o vendedor
      const sales = await LoadOrderService.load('orders', { where: { seller_id: req.session.userId } });  

      return res.render("orders/sales", { sales });
      
    } catch (error) {
        console.error(error);

        return res.render('orders/error');
    }
  },

  async show(req, res) {
    try {
      const order = await LoadOrderService.load('order', { where: { id: req.params.id } });

      return res.render("orders/details", { order });

    } catch (error) {
        console.error(error);

        return res.render('orders/error');
    }
  },

  async post(req, res) {

    try {
      // pegar os produtos do carrinho
      const cart = Cart.init(req.session.cart);

      // verifica a existência e retira os pedidos que se referem aos produtos do próprio comprador
      const buyer_id = req.session.userId;
      const filteredItems = cart.items.filter(item => item.product.user_id != buyer_id);

      // cria o pedido de cada item do carrinho
      const createOrdersPromise = filteredItems.map(async item => {
        let { product, price: total, quantity } = item;
        const { price, id: product_id, user_id: seller_id } = product;
        const status = "open";

        // monta o objeto "order" para cada item do carrinho e salva na tabela "orders"
        const order = await Order.create({
          seller_id,
          buyer_id,
          product_id,
          price,
          total,
          quantity,
          status
        });

        // envia email para cada vendedor do produto a ser comprado
        product = await LoadProductService.load('product', { where: { id: product_id } });
        const seller = await User.findOne({ where: { id: seller_id } });
        const buyer = await User.findOne({ where: { id: buyer_id } });

        await mailer.sendMail({
          to: seller.email,
          from: 'no-reply@myecommerce.com',
          subject: 'Novo pedido de compra!',
          html: emailMessage(seller, product, buyer)
        });

        return order;
      });

      await Promise.all(createOrdersPromise);

      // limpa o carrinho antes de notificar o usuário sobre o sucesso do pedido
      delete req.session.cart;
      Cart.init();

      return res.render('orders/success');

    } catch (error) {
        console.error(error);

        return res.render('orders/error');
    }
    
  },

  async update(req, res) {
    try {
      const { id, action } = req.params;
      const acceptedActions = ['close', 'cancel'];

      if (!acceptedActions.includes(action)) {
        return res.status(403).send("Can't do this action");
      }

      // busca o pedido 
      const order = await Order.findOne({ where: { id } });

      if (!order) {
        return res.status(404).send("Order not found");
      }

      // verifica se ele está com o status aberto
      if (order.status != 'open') {
        return res.status(403).send("Can't do this action");
      }

      // mapeia as ações de acordo com o parâmetro e atualiza o pedido
      const status = {
        close: "sold",
        cancel: "canceled"
      };

      order.status = status[action];

      await Order.update(id, { status: order.status });

      // redireciona
      return res.redirect('/orders/sales');

    } catch (error) {
        console.error(error);

        return res.render('orders/error');
    }
  }

}