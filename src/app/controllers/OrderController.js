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
    
  }

}