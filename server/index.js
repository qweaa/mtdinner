const express = require('express')
const app = express()
const serverConfig = require('./config').server
const qs = require('querystring');

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


/**
 * 照样输出json格式的数据
 * @param query
 * @param res
 */
const writeOut = function (query, res) {
    res.write(JSON.stringify(query));
    res.end();
}

app.all('*', function(req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With,Token");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');

    if(req.method=="OPTIONS") res.sendStatus(200);/*让options请求快速返回*/
    else {
        // res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
        if (req.method.toUpperCase() == 'POST') {
            var postData = "";
            /**
             * 因为post方式的数据不太一样可能很庞大复杂，
             * 所以要添加监听来获取传递的数据
             * 也可写作 req.on("data",function(data){});
             */
            req.addListener("data", function (data) {
                postData += data;
            });
            /**
             * 这个是如果数据读取完毕就会执行的监听方法
             */
            req.addListener("end", function () {
                var query = qs.parse(postData);
                req.query = query
                next();
            });
        }else{
            next();
        }
        // else if (req.method.toUpperCase() == 'GET') {
        //     /**
        //      * 也可使用var query=qs.parse(url.parse(req.url).query);
        //      * 区别就是url.parse的arguments[1]为true：
        //      * ...也能达到‘querystring库’的解析效果，而且不使用querystring
        //      */
        //     var query = url.parse(req.url, true).query;
        //     writeOut(query, res);
        // } else {
        //     //head put delete options etc.
        // }
    }

})
//图片加载,存储在public/images下的所有图片
app.get('/upload/images/*', function (req, res) {
    res.sendFile( __dirname + "/" + req.url.split('?')[0] );
})


const user = require('./action/user')
const store = require('./action/store')
const rules = require('./action/rules')
const menu = require('./action/menu')
const book = require('./action/book')
const admin = require('./action/admin')

app.use('/user',user)
app.use('/store',store)
app.use('/rules',rules)
app.use('/menu',menu)
app.use('/book',book)
app.use('/admin',admin)

app.get('/',(req,res)=>{
    res.send('Hello Node.js')
})

const server = app.listen(serverConfig.port, '0.0.0.0', _=>{
    console.log(`node server start at ${serverConfig.host}`)
})