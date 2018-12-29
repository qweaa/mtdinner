const express = require('express')
const app = express()
const serverConfig = require('./config').server

// const resp = require('./config').respond


// const authRoute = [
//     'order',
//     'student',
//     'book'
// ]

// function isAuthRoute(url){
//     let res = false
//     for(let i of authRoute){
//         if(url.indexOf('/' + i + '/') === 0){
//             res = true
//             break
//         }
//     }
//     return res
// }

app.all('*', function(req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With,Token");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');

    if(req.method=="OPTIONS") res.sendStatus(200);/*让options请求快速返回*/
    else next();

})
//图片加载,存储在public/images下的所有图片
app.get('/upload/images/*', function (req, res) {
    res.sendFile( __dirname + "/" + req.url.split('?')[0] );
})


const user = require('./action/user')

app.use('/user',user)

app.get('/',(req,res)=>{
    res.send('Hello Node.js')
})

const server = app.listen(serverConfig.port, '0.0.0.0', _=>{
    console.log(`node server start at ${serverConfig.host}`)
})