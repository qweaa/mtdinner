// const mysql = require('mysql');
// const CONFIG = require('./config')

// var conn = mysql.createConnection({
//     host     : CONFIG.host,
//     user     : CONFIG.user,
//     password : CONFIG.password,
//     database : CONFIG.database
// });
 
// conn.connect(err=>{
//     if(err) console.log("数据库链接失败",err)
//     else console.log("数据库链接成功")
// });

const Sequelize = require('sequelize');
const CONFIG = require('./config');

const sequelize = new Sequelize(CONFIG.database, CONFIG.user, CONFIG.password, {
    host: CONFIG.host,
    dialect: CONFIG.dialect,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: false,
        freezeTableName: true,
    },

    // 仅限 SQLite
    storage: 'path/to/database.sqlite'
});

sequelize.authenticate().then(() => {
    console.log('数据库链接成功');
}).catch(err => {
    console.error('数据库链接失败', err);
});


module.exports = sequelize