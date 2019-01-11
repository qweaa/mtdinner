const express = require('express')
const router = express.Router()
const conn = require('../model')
const resp = require('../config').respond
const utils = require('../public/utils')
const Sequelize = require('sequelize');

const Menu = conn.define('menu', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    MenuName: Sequelize.STRING,
    Status: Sequelize.INTEGER,
    Month: Sequelize.STRING,
    Week: Sequelize.STRING,
    Day: Sequelize.STRING,
    Price: Sequelize.INTEGER,
    IsComment: Sequelize.INTEGER,
    CreateTime: Sequelize.STRING,
    Store_ID: Sequelize.INTEGER,
    UpdateTime: Sequelize.STRING,
});

//取菜单列表
router.get('/GetMenuList',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = utils.Assign({
        Current_Page: 1,
        Current_Size: 1000,
        Status: false,                      //未传入为false，则请求所有状态的菜单，1：是，0：否，false：不要求
        IsComment: false,                   //是否是通用菜单，1：是，0：否，false：不要求
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
                if(value === false) return

                if(!utils.regexp.IsNumber(value)){
                    return 'Store_ID 参数错误.Number'
                }
            }
        },
        IsComment: {
            regexp: (value)=>{
                if(value === false) return

                if(!utils.regexp.IsNumber(value)){
                    return 'IsComment 参数错误.Number'
                }
            }
        },
        Current_Page: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Current_Page 参数错误.Number'
                }
            }
        },
        Current_Size: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Current_Size 参数错误.Number'
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

    let where = {
        Store_ID: query.Store_ID,
    }
    if(query.Status !== false){
        let Status = Number(query.Status)
        if(Status === 0 || Status === 1) {
            where.Status = query.Status
        }
    }
    if(query.IsComment !== false){
        let IsComment = Number(query.IsComment)
        if(IsComment === 0 || IsComment === 1) {
            where.IsComment = query.IsComment
        }
    }

    let Current_Page = Number(query.Current_Page)
    let Current_Size = Number(query.Current_Size)

    Menu.findAll({
        offset: Current_Size * (Current_Page - 1),
        limit: Current_Size,
        where: where
    }).then(data=>{
        res.json(Object.assign(respond, {
            success: true,
            data: data,
            messages: '取菜单列表成功',
        }))
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '取菜单列表错误',
        }))
    })
})

//添加菜单
router.post('/AddMenu',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = Object.assign({
        Status: 1,
        IsComment: 0,
    }, req.query)

    if(Number(query.IsComment) === 0){
        if(!query.Month){
            res.json(Object.assign(respond, {
                data: '非通用菜单，请传入Month值',
                messages: '参数错误',
            }))
            return
        }
        if(!query.Day && !query.Week){
            res.json(Object.assign(respond, {
                data: '非通用菜单，请传入Day或者Week值',
                messages: '参数错误',
            }))
            return
        }
    }

    let check = utils.CheckRequestKey({
        MenuName: {},
        Status: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Status 参数错误.Number'
                }
            }
        },
        IsComment: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'IsComment 参数错误.Number'
                }
            }
        },
        Store_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Store_ID 参数错误.Number'
                }
            }
        },
        Price: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Price 参数错误.Number'
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
        MenuName: query.MenuName,
        Status: Number(query.Status),
        Month: query.Month,
        Week: query.Week,
        Day: query.Day,
        Price: Number(query.Price),
        IsComment: Number(query.IsComment),
        Store_ID: Number(query.Store_ID),
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
                data: data,
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

//禁用菜单
router.post('/UpdateStatus',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = Object.assign({
        // Status: 1,
    }, req.query)

    let check = utils.CheckRequestKey({
        Menu_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Menu_ID 参数错误.Number'
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
    
    
    Menu.findOne({
        attributes: ['ID'],
        where: {
            ID: query.Menu_ID
        }
    }).then(findOne=>{
        if(findOne){
            Menu.update({
                Status: Number(query.Status)
            }, {
                where: {ID: query.Menu_ID}
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
                messages: '菜单不存在',
            }))
        }
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '数据库查菜单是否存在异常',
        }))
    })
})

//修改菜单信息
router.post('/UpdateMenu', (req, res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = Object.assign({
        IsComment: 0,
    }, req.query)

    if(query.IsComment === 0){
        if(!query.Month){
            res.json(Object.assign(respond, {
                data: '请传入Month值',
                messages: '参数错误',
            }))
            return
        }
        if(!query.Day && !query.Week){
            res.json(Object.assign(respond, {
                data: '请传入Day或者Week值',
                messages: '参数错误',
            }))
            return
        }
    }

    let check = utils.CheckRequestKey({
        Menu_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Menu_ID 参数错误.Number'
                }
            }
        },
        MenuName: {},
        IsComment: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'IsComment 参数错误.Number'
                }
            }
        },
        Price: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Price 参数错误.Number'
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

    Menu.findOne({
        attributes: ['ID'],
        where: {
            ID: query.Menu_ID
        }
    }).then(findOne=>{
        if(findOne){
            Menu.update({
                MenuName: query.MenuName,
                Month: query.Month,
                Week: query.Week,
                Day: query.Day,
                Price: query.Price,
                IsComment: query.IsComment,
                UpdateTime: utils.GetNow(),
            }, {
                where: {ID: query.Menu_ID}
            }).then(update=>{
                res.json(Object.assign(respond, {
                    success: true,
                    messages: '修改菜单信息成功',
                }))
            }).catch(err=>{
                res.json(Object.assign(respond, {
                    data: err,
                    messages: '修改菜单信息错误',
                }))
            })
        }else{
            res.json(Object.assign(respond, {
                data: err,
                messages: '菜单不存在',
            }))
        }
    }).catch((err)=>{
        res.json(Object.assign(respond, {
            data: err,
            messages: '查询菜单错误',
        }))
    })
})

module.exports = router