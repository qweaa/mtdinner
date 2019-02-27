const S = require('../index')
const Sequelize = S.Sequelize;
const conn = S.conn;

const model = conn.define('menutype', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    TypeName: Sequelize.STRING,
    Summary: Sequelize.STRING,
    CreateTime: Sequelize.STRING,
    UpdateTime: Sequelize.STRING,
});

module.exports = model