const User = require('../models/User');

async function post(req, res, next) {
  
  const fields = Object.keys(req.body);

  for (field of fields) {
    if (req.body[field] == "") {

      return res.render('user/register', { error: 'Por favor, preencha todos os campos', user: req.body }); 
    }
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

module.exports = { post };
