const S = require('../index')
const Sequelize = S.Sequelize;
const conn = S.conn;

const model = conn.define('menuview', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    MenuName: Sequelize.STRING,
    Status: Sequelize.INTEGER,
    Month: Sequelize.STRING,
    Week: Sequelize.STRING,
    Day: Sequelize.STRING,
    Price: Sequelize.INTEGER,
    IsComment: Sequelize.INTEGER,
    CreateTime: Sequelize.STRING,
    Store_ID: Sequelize.INTEGER,
    UpdateTime: Sequelize.STRING,

    MenuType_ID: Sequelize.INTEGER,
    TypeName: Sequelize.STRING,
    MenuTypeSummary: Sequelize.STRING,
});

module.exports = model