const regexp = {
    IsChineseName(s){
        return /^[\u2E80-\u9FFF]{2-5}$/.test(s)
    },
    HasIllegalSign(s){
        return /[\?!#$%\\^&\*\(\)\|\[\]]+/.test(s)
    },
}

const utils = {
    regexp,
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

        if(!rules || rules.constructor.name !== 'Object') return Object.assign(res, {
            messages: 'rules错误',
        })

        if(!obj || obj.constructor.name !== 'Object') return Object.assign(res, {
            messages: 'obj错误',
        })

        let rulesKeys = Object.keys(rules)
        let objKeys = Object.keys(obj)

        if(rulesKeys.length !== objKeys.length){
            return Object.assign(res, {
                messages: '请传入所需参数',
            })
        }

        for(let i in rules){
            if(!obj[i]){
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