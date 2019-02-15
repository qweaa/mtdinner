const resp = require('../config').respond

const respond = (o)=>{
    const respond = JSON.parse(JSON.stringify(resp))
    return Object.assign(respond, o)
}

const regexp = {
    IsChineseName(s){
        return /^[\u2E80-\u9FFF]{2,5}$/.test(s)
    },
    HasIllegalSign(s){
        return /[\?!#$%\\^&\*\(\)\|\[\]]+/.test(s)
    },
    IsNumber(s){
        return /^\d+$/.test(s)
    },
    isArray(s){
        return Object.prototype.toString.call(s) === '[object Array]'
    },
    isObject(s){
        return Object.prototype.toString.call(s) === '[object Object]'
    },
}

const GetNow = ()=>{
    return new Date().toLocaleString('chinese', {hour12: false}).replace(/-/g, '/')
}

const GetYear = () => {
    return new Date().getFullYear()
}

const GetMonth = () => {
    return new Date().getMonth() + 1
}

const GetDay = () => {
    return new Date().getDate()
}

const Assign = (...obj) => {
    let result = null
    for(let i of obj){
        if(Object.prototype.toString.call(i) === '[object Object]'){
            if(result === null){
                result = i
            } else {
                let resultKeys = Object.keys(result)
                for(let k in i){
                    if((i[k] !== null && i[k] !== '' && i[k] !== undefined) || resultKeys.indexOf(k) === -1){
                        result[k] = i[k]
                    }
                }
            }
        }
    }
    return result
}

const utils = {
    respond,
    regexp,
    GetNow,
    GetYear,
    GetMonth,
    GetDay,
    Assign,
    //取请求客户端的IP地址
    GetRequestIp(r){
        if(!r || !r.headers){
            return '传入值错误'
        }
        return r.header('x-forwarded-for') || r.connection.remoteAddress;
    },
    //检查传入的值是否为空
    CheckRequestKey(rules, obj){
        /*
            rules: {
                NickName: {
                    notRequire: true,
                    regexp: 'IsChineseName',     // /[1]+/
                }
            }
        */

        let res = {
            success: false,
            data: null,
            messages: '',
        }
        let err = []

        if(!rules || Object.prototype.toString.call(rules) !== '[object Object]') return Object.assign(res, {
            messages: 'rules错误',
        })

        if(!obj || Object.prototype.toString.call(obj) !== '[object Object]') return Object.assign(res, {
            messages: 'obj错误',
        })

        let rulesKeys = Object.keys(rules)
        let objKeys = Object.keys(obj)

        // if(rulesKeys.length !== objKeys.length){
            // let errorV = []
            let emptyV = []
            let messages = ''
            // for(let j of objKeys){
            //     if(rulesKeys.indexOf(j) === -1) errorV.push(j)
            // }
            for(let j of rulesKeys){
                if(objKeys.indexOf(j) === -1) emptyV.push(j)
            }
            // if(errorV.length) messages += '可能错误参数：' + errorV.join(',') + '；'
            if(emptyV.length) messages += '可能缺少参数：' + emptyV.join(',') + '；'

            if(messages !== ''){
                return Object.assign(res, {
                    messages: messages,
                })
            }
        // }

        for(let i in rules){
            if(obj[i] === '' || obj[i] === null){
                err.push({
                    key: i,
                    messages: '请传入变量值：' + i
                })
            }else{
                if(rules[i].regexp && typeof rules[i].regexp === 'function'){
                    let regexpTips = rules[i].regexp(obj[i]) || false
                    if(regexpTips){
                        err.push({
                            key: i,
                            messages: regexpTips
                        })
                    }
                }
            }
        }

        if(err.length){
            return Object.assign(res, {
                data: err,
                messages: '传参错误',
            })
        }

        return Object.assign(res, {
            success: true,
            messages: '参数正确',
        })
    },
}


module.exports = utils