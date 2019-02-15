const S = require('../index')
const Sequelize = S.Sequelize;
const conn = S.conn;

const model = conn.define('store', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    StoreName: Sequelize.STRING,
    Status: Sequelize.INTEGER,
    WeChat: Sequelize.STRING,
    Phones: Sequelize.INTEGER,
    Address: Sequelize.STRING,
    CreateTime: Sequelize.STRING,
    UpdateTime: Sequelize.STRING,
});

module.exports = model