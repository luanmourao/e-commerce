const User = require('../models/User');
const { compare } = require('bcryptjs');

async function login(req, res, next) {
 const { email, password } = req.body;

  const user = await User.findOne({ where: {email} });

  if (!user) {
    
    return res.render('session/login', {
      user: req.body,
      error: "Usuário não cadastrado"
    })
  }

  const passed = await compare(password, user.password);

  if (!passed) {

    return res.render('session/login', {
      user: req.body,
      error: "Senha incorreta"
    })
  }

  req.user = user;

  next();
}

async function forgot(req, res, next) {
  const { email } = req.body;

  try {
    let user = await User.findOne({where: {email}});

    if (!user) {
      
      return res.render('session/forgot-password', {
        user: req.body,
        error: "E-mail não cadastrado"
      })
    }

    req.user = user;

    next();

  } catch (error) {
      console.error(error);
  }
}

async function reset(req, res, next) {
  const { email, password, passwordRepeat, token } = req.body;

  // procurar o usuário
  const user = await User.findOne({ where: { email } });

  if (!user) {
    
    return res.render('session/password-reset', {
      user: req.body,
      token,
      error: "Usuário não cadastrado"
    })
  }

  // ver se as senhas correspondem
  if (password !== passwordRepeat) {

    return res.render('session/password-reset', { 
      error: 'As senhas digitadas NÃO correspondem. Tente novamente.', 
      token,
      user: req.body 
    }); 
  }

  // verificar se o token corresponde
  if (token !== user.reset_token) {

    return res.render('session/password-reset', { 
      error: 'Link inválido. Solicite uma nova recuperação de senha', 
      token,
      user: req.body 
    }); 
  }

  // verificar se o token não expirou 
  let now = new Date();
  now = now.setHours(now.getHours());

  if (now > user.reset_token_expires) {

    return res.render('session/password-reset', { 
      error: 'Seu link expirou. Solicite uma nova recuperação de senha', 
      token,
      user: req.body 
    }); 
  }

  req.user = user;

  next();
}

module.exports = { login, forgot, reset };