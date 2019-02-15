const S = require('../index')
const Sequelize = S.Sequelize;
const conn = S.conn;

const model = conn.define('rules', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    MaxCost: Sequelize.INTEGER,
    ActiveStoreID: Sequelize.INTEGER,
})


module.exports = model