const { Pool } = require("pg");

module.exports = new Pool({
  user: "luamourao",
  password: "",
  host: "localhost",
  port: 5432,
  database: "ecommercedb"
});