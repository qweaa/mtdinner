const express = require('express')
const router = express.Router()
const utils = require('../public/utils')
// const conn = require('../model')
// const Sequelize = require('sequelize')

const S = require('../model')
const Sequelize = S.Sequelize;
const conn = S.conn;

const config = require('../config')
const serverConfig = config.server
const resp = config.respond

const token = require('../public/token')

const Admin = conn.define('admin', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    Avatar: Sequelize.STRING,
    NickName: Sequelize.STRING,
    AdminName: Sequelize.STRING,
    Password: Sequelize.STRING,
    LoginTime: Sequelize.STRING,
    LogoutTime: Sequelize.STRING,
    IPs: Sequelize.STRING,
    DefaultIP: Sequelize.STRING,
    CreateTime: Sequelize.STRING,
});

const CheckAdminExist = ({key, res, password}) => {
    return new Promise((resolve, reject)=>{
        let attributes = password ? '' : { exclude: ['Password'] }
        const respond = JSON.parse(JSON.stringify(resp))
        if(!key){
            reject('缺少参数，用户不存在')
        }else{
            const Op = Sequelize.Op;
            Admin.findOne({
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

//取管理员列表
router.get('/GetAdminList',(req,res)=>{
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


    Admin.findAll({
        attributes: { exclude: ['Password'] },
        offset: query.Current_Size * (query.Current_Page - 1),
        limit: query.Current_Size
    }).then(data=>{
        res.json(Object.assign(respond, {
            success: true,
            data: data,
            messages: '取管理员列表成功',
        }))
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '取管理员列表失败',
        }))
    })
})
//取用户详细信息
router.get('/GetAdminModel',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = req.query

    if(!query.Admin_ID) query.Admin_ID = query.TokenID

    let check = utils.CheckRequestKey({
        Admin_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Admin_ID 参数错误.Number'
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

    Admin.findOne({
        attributes: { exclude: ['Password'] },
        where: {
            ID: query.Admin_ID
        }
    }).then(data=>{
        if(data){
            data.dataValues.Avatar = serverConfig.host + data.dataValues.Avatar
            res.json(Object.assign(respond, {
                success: true,
                data: data,
                messages: '取管理员详情成功',
            }))
        }else{
            res.json(Object.assign(respond, {
                messages: '管理员不存在',
            }))
        }
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '取管理员详情失败',
        }))
    })
})

//添加管理员
router.post('/AddAdmin',(req,res)=>{
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
        AdminName: {
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
    
    Admin.findOne({
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
            Admin.create({
                NickName: query.NickName,
                AdminName: query.AdminName,
                Password: query.Password,
                DefaultIP: utils.GetRequestIp(req),
                IPs: utils.GetRequestIp(req),
                CreateTime: utils.GetNow(),
            }).then(data=>{
                if(data){
                    res.json(Object.assign(respond, {
                        success: true,
                        data: data,
                        messages: '添加成功',
                    }))
                }else{
                    res.json(Object.assign(respond, {
                        messages: '添加失败',
                    }))
                }
            }).catch(error=>{
                res.json(Object.assign(respond, {
                    data: error,
                    messages: '数据库写入管理员表记录异常',
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
    
    Admin.findOne({
        attributes: ['ID', 'Password', 'IPs'],
        where: {
            NickName: query.NickName
        }
    }).then(findOne=>{
        if(findOne){
            if(findOne.Password === query.Password){
                let oldIPs = findOne.dataValues.IPs.split(',')
                let ip = utils.GetRequestIp(req)
                
                if(oldIPs.indexOf(ip) === -1){
                    let newIPs = oldIPs.concat([ip])
                    Admin.update({
                        IPs: newIPs.join(','),
                        LoginTime: utils.GetNow()
                    }, {
                        where: {NickName: query.NickName}
                    })
                }else{
                    Admin.update({
                        LoginTime: utils.GetNow()
                    }, {
                        where: {NickName: query.NickName}
                    })
                }
                
                let t = token.SetToken(findOne.ID)

                //过期时间为2小时后
                // var expireHours = 2;
                // res.cookie('token', t, {maxAge: expireHours * 3600 * 1000});

                res.json(Object.assign(respond, {
                    success: true,
                    data: {
                        token: t
                    },
                    messages: '登录成功',
                }))
            }else{
                res.json(Object.assign(respond, {
                    messages: '密码错误',
                }))
            }
        }else{
            res.json(Object.assign(respond, {
                messages: '管理员不存在',
            }))
        }
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '服务器异常',
        }))
    })
})


//退出登录
router.post('/Logout',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = req.query

    if(!query.Admin_ID) query.Admin_ID = query.TokenID

    let check = utils.CheckRequestKey({
        Admin_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Admin_ID 参数错误.Number'
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
    
    Admin.findOne({
        attributes: ['ID'],
        where: {
            ID: query.Admin_ID
        }
    }).then(findOne=>{
        if(findOne){
            
            res.cookie('token', '', {maxAge: 0});

            res.json(Object.assign(respond, {
                success: true,
                messages: '退出登录成功',
            }))
        }else{
            res.json(Object.assign(respond, {
                messages: '管理员不存在',
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
        Admin_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Admin_ID参数错误.Number'
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

    CheckAdminExist({
        key: query.Admin_ID,
        res: res,
        password: 1,
    }).then(data=>{
        if(data.Password === query.OldPassword){
            Admin.update({
                Password: query.NewPassword
            }, {
                where: {ID: query.Admin_ID}
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
        Admin_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Admin_ID参数错误.Number'
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

    CheckAdminExist({
        key: query.Admin_ID,
        res: res,
    }).then(data=>{
        Admin.update({
            Password: query.Password
        }, {
            where: {ID: query.Admin_ID}
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

module.exports = router