
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
}

module.exports = CONFIG