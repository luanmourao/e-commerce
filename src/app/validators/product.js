async function post(req, res, next) {
  const fields = Object.keys(req.body);

  for (field of fields) {
    if (req.body[field] == "") {
      return res.send("Por favor, preencha todos os campos");
    }
  }

  if (!req.files || req.files.length == 0) {
    return res.send("Por favor, selecione ao menos uma imagem para o seu produto");
  }

  next();
}

async function put(req, res, next) {
  const fields = Object.keys(req.body);

  for (field of fields) {
    if (req.body[field] == "" && field != "removed_files") {
      return res.send("Por favor, preencha todos os campos");
    }
  }

  next();
}

module.exports = {
  post,
  put
}