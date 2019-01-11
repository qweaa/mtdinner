const express = require('express')
const router = express.Router()
const conn = require('../model')
const resp = require('../config').respond
const utils = require('../public/utils')
const Sequelize = require('sequelize');

const Bookmenu = conn.define('bookmenu', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    Book_ID: Sequelize.INTEGER,
    Menu_ID: Sequelize.INTEGER,
});

//添加菜单
router.get('/AddMenu',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = Object.assign({
    }, req.query)

    let check = utils.CheckRequestKey({
        Book_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Status参数错误.Number'
                }
            }
        },
        Menu_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Status参数错误.Number'
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
    
    Menu.create({
        Book_ID: Number(query.Book_ID),
        Menu_ID: Number(query.Menu_ID),
    }).then(data=>{
        if(data){
            res.json(Object.assign(respond, {
                success: true,
                data: data,
                messages: '添加成功',
            }))
        }else{
            res.json(Object.assign(respond, {
                data: data,
                messages: '添加失败',
            }))
        }
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '数据库写入Bookmenu记录异常',
        }))
    })
})

module.exports = router