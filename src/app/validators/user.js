const User = require('../models/User');
const { compare } = require('bcryptjs');

function checkAllFields(body) {
  const fields = Object.keys(body);

  for (field of fields) {
    if (body[field] == "") {

      return { 
        user: body,
        error: 'Por favor, preencha todos os campos'
      }; 
    }
  }
}

async function post(req, res, next) {
  const fillAllFields = checkAllFields(req.body);

  if (fillAllFields) {

    return res.render('user/register', fillAllFields);
  }

  let { email, cpf_cnpj, password, passwordRepeat } = req.body;

  cpf_cnpj = cpf_cnpj.replace(/\D/g, "");

  const user = await User.findOne({
    where: {email},
    or: {cpf_cnpj}
  });

  if (user) {
    
    return res.render('user/register', { error: 'Usuário já cadastrado', user: req.body }); 
  }

  if (password !== passwordRepeat) {

    return res.render('user/register', { error: 'Os campos "SENHA" e "REPITA SUA SENHA" devem ser iguais. Tente novamente.', user: req.body }); 
  }

  next();
}

async function show(req, res, next) {
  const { userId: id } = req.session;

  const user = await User.findOne({ where: {id} });

  if (!user) {
    
    return res.render('user/register', {
      error: "Usuário não encontrado"
    })
  }

  req.user = user;

  next();
}

async function update(req, res, next) {
  // all fields
  const fillAllFields = checkAllFields(req.body);

  if (fillAllFields) {

    return res.render('user/index', fillAllFields);
  }

  // has password
  const { id, password } = req.body;

  if (!password) {

    return res.render('user/index', {
      user: req.body,
      error: "Digite sua senha para poder atualizar seu cadastro"
    })
  }

  // password match
  const user = await User.findOne({ where: {id} });

  const passed = await compare(password, user.password);

  if (!passed) {

    return res.render('user/index', {
      user: req.body,
      error: "Senha incorreta"
    })
  }

  req.user = user;

  next();
}

module.exports = { post, show, update };
