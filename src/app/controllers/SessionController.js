const crypto = require('crypto');
const { hash } = require('bcryptjs');
const User = require('../models/User');
const mailer = require('../../config/mailer');

module.exports = {

  loginForm(req, res) {

    return res.render('session/login');
  },

  login(req, res) {
    req.session.userId = req.user.id;

    return res.redirect('/users');
  },

  logout(req, res) {
    req.session.destroy();

    return res.redirect('/');
  },

  forgotForm(req, res) {

    return res.render('session/forgot-password');
  },

  async forgot(req, res) {
    const user = req.user;
    const userFirstName = user.name.split(" ")[0];

    try {
      // token para o usuário
      const token = crypto.randomBytes(20).toString("hex");

      // criar data de expiração para o token
      let tokenExpiresIn = new Date();
      tokenExpiresIn = tokenExpiresIn.setHours(tokenExpiresIn.getHours() + 1);

      // adicionar token e data de expiração na tabela de usuários
      await User.update(user.id, {
        reset_token: token,
        reset_token_expires: tokenExpiresIn
      })

      // enviar um e-mail com o link de recuperação de senha 
      await mailer.sendMail({
        to: user.email,
        from: 'no-reply@ecommerce.com.br',
        subject: 'Recuperação de senha | myE-Commerce',
        html: `
          <h2>Olá ${userFirstName},
          <h3>Você esqueceu sua senha?</h3>
          <p>Não se preocupe, clique no botão abaixo para recuperar sua senha.</p>
          <p>
            <a href="http://localhost:5000/users/password-reset?token=${token}" style="display:inline-block; margin: 0 auto; background-color:#1f4668; border-radius:4px; padding:16px 32px; text-decoration:none; color:white; font-weight:bold; font-family:sans-serif" target="_blank">
              RECUPERAR SENHA
            </a>
          </p>
          <p>Caso você não tenha solicitado alteração de senha, desconsidere este email</p>
          </br>
          <p>Atenciosamente,</p>
          <p>Equipe | myE-Commerce</p>
        `
      })

      // avisar o usuário que o e-mail foi enviado
      return res.render('session/forgot-password', {
        success: "OK! Enviamos um e-mail para você com as instruções de recuperação"
      });
    } catch (error) {
        console.error(error);
        return res.render('session/forgot-password', {
          error: "Puxa! Algo estranho aconteceu no nosso sistema, tente novamente dentro de alguns minutos"
        });
    }
    
  },

  resetForm(req, res) {

    return res.render('session/password-reset', { token: req.query.token });
  },

  async reset(req, res) {
    const user = req.user;
    const { password, token } = req.body;

    try {
      // criar um novo hash de senha
      const newPassword = await hash(password, 8);

      // atualizar o cadastro do usuário 
      await User.update(user.id, {
        password: newPassword,
        reset_token: null,
        reset_token_expires: null
      });

      // avisar o usuário que seu nova senha foi cadastrada com sucesso 
      return res.render('session/login', {
        user: req.body,
        success: "Senha atualizada com sucesso! Faça seu login"
      })
      
    } catch (error) {
        console.error(error);
        return res.render('session/forgot-password', {
          error: "Puxa! Algo estranho aconteceu no nosso sistema, tente novamente dentro de alguns minutos",
          token,
          user: req.body
        });
    }

  }
}