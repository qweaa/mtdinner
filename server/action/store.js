const express = require('express')
const router = express.Router()
const conn = require('../model')
const resp = require('../config').respond
const utils = require('../public/utils')
const Sequelize = require('sequelize');

const Store = conn.define('store', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    StoreName: Sequelize.STRING,
    Status: Sequelize.INTEGER,
    WeChat: Sequelize.STRING,
    Phones: Sequelize.INTEGER,
    Address: Sequelize.STRING,
    CreateTime: Sequelize.STRING,
    UpdateTime: Sequelize.STRING,
});

//取店铺列表
router.get('/GetStoreList',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = Object.assign({
        Current_Page: 1,
        Current_Size: 10,
        Status: false,                  //未传入为false，则请求所有状态的店铺
    }, req.query)

    let check = utils.CheckRequestKey({
        Status: {
            regexp: (value)=>{
                if(value === false) return

                if(!utils.regexp.IsNumber(value)){
                    return 'Store_ID 参数错误.Number'
                }
            }
        },
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

    let where = {}

    if(query.Status !== false){
        let Status = Number(query.Status)
        if(Status === 0 || Status === 1) {
            where.Status = query.Status
        }
    }

    let Current_Page = Number(query.Current_Page)
    let Current_Size = Number(query.Current_Size)

    Store.findAll({
        offset: Current_Size * (Current_Page - 1),
        limit: Current_Size,
        where: where
    }).then(data=>{
        res.json(Object.assign(respond, {
            success: true,
            data: data,
            messages: '取店铺列表成功',
        }))
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '取店铺列表错误',
        }))
    })
})

//添加店铺
router.post('/AddStore',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = Object.assign({
        Status: 1,
    }, req.query)

    let check = utils.CheckRequestKey({
        StoreName: {},
        Phones: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Phones 参数错误.Number'
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
    
    Store.create({
        StoreName: query.StoreName,
        Status: query.Status,
        WeChat: query.WeChat,
        Phones: query.Phones,
        Address: query.Address,
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
            messages: '数据库写入店铺记录异常',
        }))
    })
})

//禁用店铺
router.post('/UpdateStatus',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = Object.assign({
        // Status: 1,
    }, req.query)

    let check = utils.CheckRequestKey({
        Store_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Store_ID 参数错误.Number'
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
    
    
    Store.findOne({
        attributes: ['ID'],
        where: {
            ID: query.Store_ID
        }
    }).then(findOne=>{
        if(findOne){
            Store.update({
                Status: Number(query.Status)
            }, {
                where: {ID: query.Store_ID}
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
                messages: '店铺不存在',
            }))
        }
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '数据库查店铺是否存在异常',
        }))
    })
})

//修改店铺信息
router.post('/UpdateStore', (req, res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = Object.assign({

    }, req.query)

    let check = utils.CheckRequestKey({
        Store_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Store_ID 参数错误.Number'
                }
            }
        },
        StoreName: {},
        Phones: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Phones 参数错误.Number'
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

    Store.findOne({
        attributes: ['ID'],
        where: {
            ID: query.Store_ID
        }
    }).then(findOne=>{
        if(findOne){
            Store.update({
                StoreName: query.StoreName,
                WeChat: query.WeChat,
                Phones: query.Phones,
                Address: query.Address,
                UpdateTime: utils.GetNow(),
            }, {
                where: {ID: query.Store_ID}
            }).then(update=>{
                res.json(Object.assign(respond, {
                    success: true,
                    messages: '修改店铺信息成功',
                }))
            }).catch(err=>{
                res.json(Object.assign(respond, {
                    data: err,
                    messages: '修改店铺信息错误',
                }))
            })
        }else{
            res.json(Object.assign(respond, {
                data: err,
                messages: '店铺不存在',
            }))
        }
    }).catch((err)=>{
        res.json(Object.assign(respond, {
            data: err,
            messages: '查询店铺错误',
        }))
    })
})

module.exports = router