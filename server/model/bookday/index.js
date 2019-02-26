const S = require('../index')
const Sequelize = S.Sequelize;
const conn = S.conn;

const model = conn.define('bookday', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    Year: Sequelize.STRING,
    Month: Sequelize.STRING,
    Day: Sequelize.STRING,
    Status: Sequelize.INTEGER,
    Store_id: Sequelize.INTEGER,
    BookCount: Sequelize.INTEGER,
    BookNumber: Sequelize.INTEGER,
    CreateTime: Sequelize.STRING,
});

module.exports = model