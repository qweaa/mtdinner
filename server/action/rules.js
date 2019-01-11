const express = require('express')
const router = express.Router()
const conn = require('../model')
const resp = require('../config').respond
const utils = require('../public/utils')
const Sequelize = require('sequelize');

const Rules = conn.define('rules', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    MaxCost: Sequelize.INTEGER,
    ActiveStoreID: Sequelize.INTEGER,
})

//修改规则
router.post('/UpdateRules',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = Object.assign({
        MaxCost: 25,
    }, req.query)

    let check = utils.CheckRequestKey({
        MaxCost: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'MaxCost 参数错误.Number'
                }
            }
        },
        ActiveStoreID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'ActiveStoreID 参数错误.Number'
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
    
    Rules.findOne({
        attributes: ['ID'],
        where: {
            ID: 0
        }
    }).then(findOne=>{
        if(findOne){
            Rules.update({
                MaxCost: Number(query.MaxCost),
                ActiveStoreID: Number(query.ActiveStoreID),
            }, {
                where: {ID: 0}
            }).then(update=>{
                res.json(Object.assign(respond, {
                    success: true,
                    data: update,
                    messages: '设置成功',
                }))
            }).catch(err=>{
                res.json(Object.assign(respond, {
                    data: err,
                    messages: '设置失败',
                }))
            })
        }else{
            Rules.create({
                MaxCost: Number(query.MaxCost)
            }).then(data=>{
                if(data){
                    res.json(Object.assign(respond, {
                        success: true,
                        data: data,
                        messages: '设置成功',
                    }))
                }else{
                    res.json(Object.assign(respond, {
                        data: data,
                        messages: '设置失败',
                    }))
                }
            }).catch(error=>{
                res.json(Object.assign(respond, {
                    data: error,
                    messages: '设置失败',
                }))
            })
        }
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '数据库查规则表异常',
        }))
    })
})


module.exports = router