const express = require('express')
const app = express()
const config = require('./config')
const token = require('./public/token')
const qs = require('querystring');

const serverConfig = config.server
const resp = config.respond

const NotTestMethods = ['Login', 'Register', 'Logout']

const IsNotTestMethod = (url) => {
    if(!url) return false
    let u = url.split('/')
    let method = u[u.length - 1]

    return NotTestMethods.indexOf(method) !== -1
}

const GetCookie = (req) => {
    if(!req || !req.headers || !req.headers.cookie){
        return false
    }
    let Cookies = {};
    req.headers.cookie.split(';').forEach(l => {
        var parts = l.split('=');
        Cookies[parts[0].trim()] = (parts[1] || '').trim();
    });
    return Cookies
}

//图片加载,存储在public/images下的所有图片
app.get('/upload/images/*', function (req, res) {
    res.sendFile( __dirname + "/" + req.url.split('?')[0] );
})

app.all('*', function(req, res, next) {

    // res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept, X-Requested-With, X-Token, Dev");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header('Access-Control-Allow-Credentials', 'true');

    if(req.method=="OPTIONS") res.sendStatus(200);/*让options请求快速返回*/
    else {
        if(!req.headers.dev){
            if(!IsNotTestMethod(req.originalUrl)){
                let t = GetCookie(req)[config.TOKEN_KEY]
                const respond = JSON.parse(JSON.stringify(resp))

                if(!t){
                    res.json(Object.assign(respond, {
                        data: config.ILLEGAL_TOKEN,
                        messages: '请登录后访问',
                    }))
                    return
                }

                let {uid, overduetime} = token.GetTokenUid(t)

                if(overduetime <= new Date().getTime()){
                    res.json(Object.assign(respond, {
                        data: config.OVERDUE_TIME_TOKEN,
                        messages: '会话已过期，请重新登录',
                    }))
                    return
                }

                req.query.TokenID = uid
            }
        }

        if(req.headers['x-token']) {
            let {uid} = token.GetTokenUid(req.headers['x-token'])
            req.query.TokenID = uid
        }

        if (req.method.toUpperCase() == 'POST') {
            var postData = "";
            req.addListener("data", function (data) {
                postData += data;
            });
            req.addListener("end", function () {
                var query = qs.parse(postData);
                req.query = Object.assign(query, req.query)
                next();
            });
        }else{
            next();
        }
    }

})

const user = require('./action/user')
const store = require('./action/store')
const rules = require('./action/rules')
const menu = require('./action/menu')
const book = require('./action/book')
const admin = require('./action/admin')
const bookday = require('./action/bookday')

app.use('/user',user)
app.use('/store',store)
app.use('/rules',rules)
app.use('/menu',menu)
app.use('/book',book)
app.use('/admin',admin)
app.use('/bookday',bookday)

app.get('/',(req,res)=>{
    res.send('Hello Node.js')
})

const server = app.listen(serverConfig.port, '0.0.0.0', _=>{
    console.log(`node server start at ${serverConfig.host}`)
})