const S = require('../index')
const Sequelize = S.Sequelize;
const conn = S.conn;

const model = conn.define('bookmenu', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    Book_ID: Sequelize.INTEGER,
    Menu_ID: Sequelize.INTEGER,
});

module.exports = model