const express = require('express')
const router = express.Router()
const conn = require('../model')
const resp = require('../config').respond
const utils = require('../public/utils')
const Sequelize = require('sequelize');

const User = conn.define('user', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    NickName: Sequelize.STRING,
    UserName: Sequelize.STRING,
    Password: Sequelize.STRING,
    DefaultIP: Sequelize.STRING,
    LoginIPs: Sequelize.STRING,
    CreateTime: Sequelize.STRING,
    Status: Sequelize.INTEGER,
});

const CheckUserExist = (key) => {
    return new Promise((resolve, reject)=>{
        const respond = JSON.parse(JSON.stringify(resp))
        if(!key){
            resolve(Object.assign(respond, {
                messages: '请传入用户标识',
            }))
        }else{
            const Op = Sequelize.Op;
            User.findOne({
                attributes: { exclude: ['Password'] },
                where: {
                    [Op.or]: [{ID: key}, {NickName: key}]
                }
            }).then(data=>{
                if(data){
                    resolve(Object.assign(respond, {
                        success: true,
                        data: data,
                        messages: '查询用户成功',
                    }))
                }else{
                    resolve(Object.assign(respond, {
                        messages: '用户不存在',
                    }))
                }
            }).catch(error=>{
                reject(error)
            })
        }
    })
}

//取用户列表
router.get('/GetUserList',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = req.query

    const Current_Page = query.Current_Page || 1
    const Current_Size = query.Current_Size || 10

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
            messages: '取用户列表失败',
        }))
    })
})
//取用户详细信息
router.get('/GetUserModel',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = req.query

    let check = utils.CheckRequestKey({
        User_ID: {},
    }, query)
    
    if(!check.success){
        res.json(Object.assign(respond, {
            data: check,
            messages: '参数错误',
        }))
        return
    }

    // if(!query.User_ID){
    //     res.json(Object.assign(respond, {
    //         messages: '请传入User_ID的值',
    //     }))
    //     return
    // }

    CheckUserExistById(query.User_ID).then(user=>{

    })
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
router.get('/Register',(req,res)=>{
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
                CreateTime: new Date().toLocaleString('chinese', {hour12: false}),
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
router.get('/Login',(req,res)=>{
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
        attributes: ['Password'],
        where: {
            NickName: query.NickName
        }
    }).then(findOne=>{
        if(findOne){
            if(findOne.Password === query.Password){
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
            messages: '数据库查询昵称唯一性异常',
        }))
    })
})

//修改密码
router.get('/UpdatePassword',(req,res)=>{
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
            messages: '取用户列表失败',
        }))
    })
})

module.exports = router