const express = require('express')
const router = express.Router()
const config = require('../config')
const utils = require('../public/utils')
// const conn = require('../model')
// const Sequelize = require('sequelize')

const S = require('../model')
const Sequelize = S.Sequelize;
const conn = S.conn;

// const serverConfig = config.server
const resp = config.respond

const token = require('../public/token')

const User = conn.define('user', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    NickName: Sequelize.STRING,
    UserName: Sequelize.STRING,
    Password: Sequelize.STRING,
    DefaultIP: Sequelize.STRING,
    IPs: Sequelize.STRING,
    CreateTime: Sequelize.STRING,
    UpdateTime: Sequelize.STRING,
    Status: Sequelize.INTEGER,
});

const CheckUserExist = ({key, res, password}) => {
    return new Promise((resolve, reject)=>{
        let attributes = password ? '' : { exclude: ['Password'] }
        const respond = JSON.parse(JSON.stringify(resp))
        if(!key){
            reject('缺少参数，用户不存在')
        }else{
            const Op = Sequelize.Op;
            User.findOne({
                attributes: attributes,
                where: {
                    [Op.or]: [{ID: key}, {NickName: key}]
                }
            }).then(data=>{
                if(data){
                    resolve(data.dataValues)
                }else{
                    reject('用户不存在')
                }
            }).catch(error=>{
                res && res.json && res.json(Object.assign(respond, {
                    data: error,
                    messages: '查询用户是否存在错误',
                }))
                // reject(error)
            })
        }
    })
}

//取用户列表
router.get('/GetUserList',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = Object.assign({
        Current_Page: 1,
        Current_Size: 10,
    }, req.query)

    let check = utils.CheckRequestKey({
        Current_Page: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Current_Page参数错误.Number'
                }
            }
        },
        Current_Size: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Current_Size参数错误.Number'
                }
            }
        },
    }, query)
    
    if(!check.success){
        res.json(Object.assign(respond, {
            data: check,
            messages: '参数错误',
        }))
        return
    }

    let Current_Page = Number(query.Current_Page)
    let Current_Size = Number(query.Current_Size)

    User.findAll({
        attributes: { exclude: ['Password'] },
        offset: Current_Size * (Current_Page - 1),
        limit: Current_Size
    }).then(data=>{
        res.json(Object.assign(respond, {
            success: true,
            data: data,
            messages: '取用户列表成功',
        }))
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '取用户列表错误',
        }))
    })
})
//取用户详细信息
router.get('/GetUserModel',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = req.query

    let check = utils.CheckRequestKey({
        User_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'User_ID 参数错误.Number'
                }
            }
        },
    }, query)
    
    if(!check.success){
        res.json(Object.assign(respond, {
            data: check,
            messages: '参数错误',
        }))
        return
    }

    User.findOne({
        attributes: { exclude: ['Password'] },
        where: {
            ID: query.User_ID
        }
    }).then(data=>{
        if(data){
            res.json(Object.assign(respond, {
                success: true,
                data: data,
                messages: '取用户列表成功',
            }))
        }else{
            res.json(Object.assign(respond, {
                messages: '用户不存在',
            }))
        }
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '取用户列表失败',
        }))
    })
})

//注册用户
router.post('/Register',(req,res)=>{
    
    const respond = JSON.parse(JSON.stringify(resp))

    const query = req.query

    let check = utils.CheckRequestKey({
        NickName: {
            regexp: (value)=>{
                if(utils.regexp.HasIllegalSign(value)){
                    return '昵称不得含有非法字符'
                }
            }
        },
        UserName: {
            regexp: (value)=>{
                if(!utils.regexp.IsChineseName(value)){
                    return '请使用中文名字'
                }
            }
        },
        Password: {
            regexp: (value)=>{
                if(utils.regexp.HasIllegalSign(value)){
                    return '密码不得含有非法字符'
                }
            }
        }
    }, query)
    
    if(!check.success){
        res.json(Object.assign(respond, {
            data: check,
            messages: '参数错误',
        }))
        return
    }
    
    User.findOne({
        attributes: ['ID'],
        where: {
            NickName: query.NickName
        }
    }).then(findOne=>{
        if(findOne){
            res.json(Object.assign(respond, {
                messages: '昵称已存在',
            }))
        }else{
            User.create({
                NickName: query.NickName,
                UserName: query.UserName,
                Password: query.Password,
                DefaultIP: utils.GetRequestIp(req),
                IPs: utils.GetRequestIp(req),
                CreateTime: utils.GetNow(),
            }).then(data=>{
                if(data){
                    res.json(Object.assign(respond, {
                        success: true,
                        data: data,
                        messages: '注册成功',
                    }))
                }else{
                    res.json(Object.assign(respond, {
                        messages: '注册失败',
                    }))
                }
            }).catch(error=>{
                res.json(Object.assign(respond, {
                    data: error,
                    messages: '数据库写入用户记录异常',
                }))
            })
        }
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '数据库查询昵称唯一性异常',
        }))
    })
})

//登录
router.post('/Login',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = req.query

    let check = utils.CheckRequestKey({
        NickName: {
            regexp: (value)=>{
                if(utils.regexp.HasIllegalSign(value)){
                    return '昵称不得含有非法字符'
                }
            }
        },
        Password: {
            regexp: (value)=>{
                if(utils.regexp.HasIllegalSign(value)){
                    return '密码不得含有非法字符'
                }
            }
        }
    }, query)
    
    if(!check.success){
        res.json(Object.assign(respond, {
            data: check,
            messages: '参数错误',
        }))
        return
    }
    
    User.findOne({
        attributes: ['ID', 'Password', 'IPs'],
        where: {
            NickName: query.NickName
        }
    }).then(findOne=>{
        if(findOne){
            if(findOne.dataValues.Password === query.Password){
                let oldIPs = findOne.dataValues.IPs.split(',')
                let ip = utils.GetRequestIp(req)
                if(oldIPs.indexOf(ip) === -1){
                    let newIPs = oldIPs.concat([ip])
                    User.update({
                        IPs: newIPs.join(',')
                    }, {
                        where: {NickName: query.NickName}
                    })
                }

                let t = token.SetToken(findOne.ID)
                res.setHeader(
                    "Set-Cookie", `token=${t};max-age=${2 * 60 * 60 * 1000}`
                )
                res.json(Object.assign(respond, {
                    success: true,
                    messages: '登录成功',
                }))
            }else{
                res.json(Object.assign(respond, {
                    messages: '密码错误',
                }))
            }
        }else{
            res.json(Object.assign(respond, {
                messages: '用户不存在',
            }))
        }
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '服务器异常',
        }))
    })
})

//修改密码
router.post('/UpdatePassword',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = req.query

    let check = utils.CheckRequestKey({
        User_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'User_ID参数错误.Number'
                }
            }
        },
        OldPassword: {
            regexp: (value)=>{
                if(utils.regexp.HasIllegalSign(value)){
                    return '原始密码不得含有非法字符'
                }
            }
        },
        NewPassword: {
            regexp: (value)=>{
                if(utils.regexp.HasIllegalSign(value)){
                    return '新密码不得含有非法字符'
                }
            }
        }
    }, query)
    
    if(!check.success){
        res.json(Object.assign(respond, {
            data: check,
            messages: '参数错误',
        }))
        return
    }

    CheckUserExist({
        key: query.User_ID,
        res: res,
        password: 1,
    }).then(data=>{
        if(data.Password === query.OldPassword){
            User.update({
                Password: query.NewPassword
            }, {
                where: {ID: query.User_ID}
            }).then(update=>{
                res.json(Object.assign(respond, {
                    success: true,
                    messages: '修改密码成功',
                }))
            }).catch(err=>{
                res.json(Object.assign(respond, {
                    data: err,
                    messages: '修改密码失败',
                }))
            })
        }else{
            res.json(Object.assign(respond, {
                messages: '原始密码错误',
            }))
        }
    }).catch((messages)=>{
        res.json(Object.assign(respond, {
            messages: messages,
        }))
    })
})

//重置密码
router.post('/ResetPassword', (req, res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = req.query

    let check = utils.CheckRequestKey({
        User_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'User_ID参数错误.Number'
                }
            }
        },
        Password: {
            regexp: (value)=>{
                if(utils.regexp.HasIllegalSign(value)){
                    return '密码不得含有非法字符'
                }
            }
        }
    }, query)
    
    if(!check.success){
        res.json(Object.assign(respond, {
            data: check,
            messages: '参数错误',
        }))
        return
    }

    CheckUserExist({
        key: query.User_ID,
        res: res,
    }).then(data=>{
        User.update({
            Password: query.Password
        }, {
            where: {ID: query.User_ID}
        }).then(update=>{
            res.json(Object.assign(respond, {
                success: true,
                messages: '重置密码成功',
            }))
        }).catch(err=>{
            res.json(Object.assign(respond, {
                data: err,
                messages: '重置密码失败',
            }))
        })
    }).catch((messages)=>{
        res.json(Object.assign(respond, {
            messages: messages,
        }))
    })
})

//修改用户状态
router.post('/UpdateStatus',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = req.query

    let check = utils.CheckRequestKey({
        User_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'User_ID 参数错误.Number'
                }
            }
        },
        Status: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Status 参数错误.Number'
                }
            }
        },
    }, query)
    
    if(!check.success){
        res.json(Object.assign(respond, {
            data: check,
            messages: '参数错误',
        }))
        return
    }
    
    
    User.findOne({
        attributes: ['ID'],
        where: {
            ID: query.User_ID
        }
    }).then(findOne=>{
        if(findOne){
            User.update({
                Status: Number(query.Status),
                UpdateTime: utils.GetNow(),
            }, {
                where: {ID: query.User_ID}
            }).then(update=>{
                res.json(Object.assign(respond, {
                    success: true,
                    messages: '设置成功',
                }))
            }).catch(err=>{
                res.json(Object.assign(respond, {
                    data: err,
                    messages: '设置失败',
                }))
            })
        }else{
            res.json(Object.assign(respond, {
                messages: '用户不存在',
            }))
        }
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '服务器异常',
        }))
    })
})

module.exports = router