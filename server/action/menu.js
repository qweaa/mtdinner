const express = require('express')
const router = express.Router()
const resp = require('../config').respond
const utils = require('../public/utils')

const S = require('../model')
const Sequelize = S.Sequelize;
const conn = S.conn;

const Menu = conn.define('menu', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    MenuName: Sequelize.STRING,
    Status: Sequelize.INTEGER,
    Year: Sequelize.STRING,
    Month: Sequelize.STRING,
    Week: Sequelize.STRING,
    Day: Sequelize.STRING,
    Price: Sequelize.INTEGER,
    IsComment: Sequelize.INTEGER,
    CreateTime: Sequelize.STRING,
    Store_ID: Sequelize.INTEGER,
    UpdateTime: Sequelize.STRING,
});

const MenuFun = require('../model/menuview/fun')

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

//取菜单详细信息
router.get('/GetMenuModel',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = req.query

    let check = utils.CheckRequestKey({
        Menu_ID: {
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

    Menu.findOne({
        attributes: { exclude: ['Password'] },
        where: {
            ID: query.Menu_ID
        }
    }).then(data=>{
        if(data){
            res.json(Object.assign(respond, {
                success: true,
                data: data,
                messages: '取菜单成功',
            }))
        }else{
            res.json(Object.assign(respond, {
                messages: '菜单不存在',
            }))
        }
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: {
                error,
                messages: 'GetMenuModel 服务异常'
            },
            messages: '服务器异常',
        }))
    })
})

//添加菜单
router.post('/AddMenu',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = Object.assign({
        Status: 1,
        IsComment: 1,
    }, req.query)

    let typeError

    switch(Number(query.IsComment)){
        case 1: 
            break;
        case 2: {
            if(!query.Month){
                typeError = Object.assign(respond, {
                    data: '使用月份，请传入 Month 值',
                    messages: '参数错误',
                })
            }
            break
        }
        case 3: {
            if(!query.Week){
                typeError = Object.assign(respond, {
                    data: '使用每周星期，请传入 Week 值',
                    messages: '参数错误',
                })
            }
            break
        }
        case 4: {
            if(!query.Day){
                typeError = Object.assign(respond, {
                    data: '使用每月几号，请传入 Day 值',
                    messages: '参数错误',
                })
            }
            break
        }
        case 5: {
            if(!query.Day || !query.Year || !query.Month){
                typeError = Object.assign(respond, {
                    data: '使用固定日期，请传入 Year Month Day 值',
                    messages: '参数错误',
                })
            }
            break
        }
        default: {
            typeError = Object.assign(respond, {
                data: 'IsComment 值必须为1-5',
                messages: '参数错误',
            })
        }
    }

    if(typeError){
        res.json(typeError)
        return
    }

    let check = utils.CheckRequestKey({
        MenuName: {},
        Status: {
            isNumber: true,
        },
        IsComment: {
            isNumber: true,
        },
        Store_ID: {
            isNumber: true,
        },
        MenuType_ID: {
            isNumber: true,
        },
        Price: {
            isNumber: true,
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
        Year: query.Year,
        Month: query.Month,
        Week: query.Week,
        Day: query.Day,
        Price: Number(query.Price),
        IsComment: Number(query.IsComment),
        Store_ID: Number(query.Store_ID),
        CreateTime: utils.GetNow(),
        MenuType_ID: query.MenuType_ID,
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

//根据多个菜单ID取菜单信息
router.get('/GetMenuByIds',(req,res)=>{
    (async ()=>{
        if(!req.query || !req.query.MenuList){
            res.json(
                utils.respond({
                    data: '请传入MenuList',
                    messages: '参数错误',
                })
            )
        }
        const MenuData = await MenuFun.GetMenuListByIds(req.query.MenuList.split(','))

        if(!MenuData.success){
            res.json(MenuData)
            return
        }

        if(!MenuData.success){
            res.json(MenuData)
            return
        }

        res.json(MenuData)

    })()
})

//根据店铺id取菜单信息
router.get('/GetMenuByStoreid',async (req,res)=>{
    if(!req.query || !req.query.Store_ID){
        res.json(
            utils.respond({
                data: '请传入 Store_ID',
                messages: '参数错误',
            })
        )
    }
    const MenuData = await MenuFun.GetMenuListByStoreid(req.query.Store_ID)

    if(!MenuData.success){
        res.json(MenuData)
        return
    }

    res.json(MenuData)
})

module.exports = router