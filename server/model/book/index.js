const S = require('../index')
const Sequelize = S.Sequelize;
const conn = S.conn;

const model = conn.define('book', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    Status: Sequelize.INTEGER,
    BookStatus: Sequelize.INTEGER,
    User_ID: Sequelize.INTEGER,
    Store_ID: Sequelize.INTEGER,
    Year: Sequelize.INTEGER,
    Month: Sequelize.INTEGER,
    Day: Sequelize.INTEGER,
    CreateTime: Sequelize.STRING,
    BookTime: Sequelize.STRING,
    UpdateTime: Sequelize.STRING,
    TotalPrice: Sequelize.STRING,
    Remark: Sequelize.STRING,
    MenuList: Sequelize.STRING,
});

module.exports = model