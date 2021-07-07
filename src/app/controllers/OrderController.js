const User = require('../models/User');
const LoadProductService = require('../services/LoadProductService');
const mailer = require('../../config/mailer');

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
      const product = await LoadProductService.load('product', { where: { id: req.body.id } });
      const seller = await User.findOne({ where: { id: product.user_id } });
      const buyer = await User.findOne({ where: { id: req.session.userId } });

      await mailer.sendMail({
        to: seller.email,
        from: 'no-reply@myecommerce.com',
        subject: 'Novo pedido de compra!',
        html: emailMessage(seller, product, buyer)
      });

      return res.render('orders/success');

    } catch (error) {
        console.error(error);

        return res.render('orders/error');
    }
    
  }

}