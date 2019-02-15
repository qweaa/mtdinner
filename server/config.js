
// 在开发环境中获取局域网中的本机iP地址
const interfaces = require('os').networkInterfaces();

let IPAdress = 'localhost',
    port = 9093

for(var devName in interfaces){
    var iface = interfaces[devName];  
    for(var i=0;i<iface.length;i++){  
        var alias = iface[i];  
        if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){  
            IPAdress = alias.address;  
        }  
    } 
}

console.log("IP：",IPAdress)

const CONFIG = {
    respond: {
        success: false,
        data: null,
        messages: '请求失败',
    },
    server: {
        address: IPAdress,
        port: port,
        host: 'http://' + IPAdress + ':' + port
    },

    ILLEGAL_TOKEN: 50008,             //非法token
    ELSE_LOGIN_TOKEN: 50012,          //其他地方登录了
    OVERDUE_TIME_TOKEN: 50014,        //token过期

    TOKEN_KEY: 'Admin-Token',            //token的名称，必须与前端一致
}

module.exports = CONFIG