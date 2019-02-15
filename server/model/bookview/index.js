const S = require('../index')
const Sequelize = S.Sequelize;
const conn = S.conn;

const model = conn.define('bookview', {
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
    NickName: Sequelize.STRING,
    UserName: Sequelize.STRING,
    Remark: Sequelize.STRING,
    MenuList: Sequelize.STRING,
    StoreName: Sequelize.STRING,
    StoreAddress: Sequelize.STRING,
    StorePhones: Sequelize.STRING,
    StoreStatus: Sequelize.STRING,
});

module.exports = model