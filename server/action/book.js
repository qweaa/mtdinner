const express = require('express')
const router = express.Router()
const conn = require('../model')
const resp = require('../config').respond
const utils = require('../public/utils')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const Book = conn.define('book', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    Status: Sequelize.INTEGER,
    BookStatus: Sequelize.INTEGER,
    User_ID: Sequelize.INTEGER,
    Year: Sequelize.INTEGER,
    Month: Sequelize.INTEGER,
    Day: Sequelize.INTEGER,
    CreateTime: Sequelize.STRING,
    TotalPrice: Sequelize.STRING,
    Remark: Sequelize.STRING,
    MenuList: Sequelize.STRING,
});

const Bookview = conn.define('bookview', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    Status: Sequelize.INTEGER,
    BookStatus: Sequelize.INTEGER,
    User_ID: Sequelize.INTEGER,
    Year: Sequelize.INTEGER,
    Month: Sequelize.INTEGER,
    Day: Sequelize.INTEGER,
    CreateTime: Sequelize.STRING,
    TotalPrice: Sequelize.STRING,
    NickName: Sequelize.STRING,
    UserName: Sequelize.STRING,
    Remark: Sequelize.STRING,
    MenuList: Sequelize.STRING,
});

const Bookmenu = conn.define('bookmenu', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    Book_ID: Sequelize.INTEGER,
    Menu_ID: Sequelize.INTEGER,
});

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
});

//取订单列表
router.get('/GetBookList',(req,res)=>{
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

    Bookview.findAll({
        offset: Current_Size * (Current_Page - 1),
        limit: Current_Size
    }).then(data=>{
        res.json(Object.assign(respond, {
            success: true,
            data: data,
            messages: '取订单列表成功',
        }))
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '取订单列表失败',
        }))
    })
})

//取订单详细信息
router.get('/GetBookDetail',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = req.query

    let check = utils.CheckRequestKey({
        Book_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'Book_ID 参数错误.Number'
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

    Bookview.findOne({
        where: {
            ID: query.Book_ID
        }
    }).then(BookviewData=>{
        if(BookviewData){
            let MenuList = BookviewData.MenuList.split(',');
            Menu.findAll({
                where: {
                    ID: {
                        [Op.in]: MenuList,
                    }
                }
            }).then(MenuData=>{
                if(MenuData){
                    BookviewData.dataValues.MenuData = MenuData
                    res.json(Object.assign(respond, {
                        success: true,
                        data: BookviewData,
                        messages: '取订单详情成功',
                    }))
                }else{
                    res.json(Object.assign(respond, {
                        messages: '取订单菜单信息失败',
                    }))
                }
            }).catch(error=>{
                res.json(Object.assign(respond, {
                    data: error,
                    messages: '取订单菜单信息错误',
                }))
            })
        }else{
            res.json(Object.assign(respond, {
                messages: '订单不存在',
            }))
        }
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '取订单基本信息错误',
        }))
    })

})

//提交订单
router.get('/SubmitBook',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = Object.assign({
        Status: 1,
        BookStatus: 1,
    }, req.query)

    let check = utils.CheckRequestKey({
        MenuList: {
            regexp: (value)=>{
                let MenuList = value.split(',')
                for(let i of MenuList){
                    if(!utils.regexp.IsNumber(i)){
                        return 'MenuList 参数格式错误'
                    }
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
        BookStatus: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'BookStatus 参数错误.Number'
                }
            }
        },
        User_ID: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'User_ID 参数错误.Number'
                }
            }
        },
        Remark: {},
    }, query)
    
    if(!check.success){
        res.json(Object.assign(respond, {
            data: check,
            messages: '参数错误',
        }))
        return
    }

    let MenuList = query.MenuList.split(',')

    Menu.findAll({
        attributes: ['Price'],
        where: {
            ID: {
                [Op.in]: MenuList,
            }
        }
    }).then(MenuData=>{
        if(MenuData){
            let TotalPrice = 0
            for(let i of MenuData){
                TotalPrice += i.Price
            }
            Book.create({
                Status: Number(query.Status),
                BookStatus: Number(query.BookStatus),
                Remark: query.Remark,
                Year: utils.GetYear(),
                Month: utils.GetMonth(),
                Day: utils.GetDay(),
                User_ID: Number(query.User_ID),
                CreateTime: utils.GetNow(),
                TotalPrice: TotalPrice,
            }).then(data=>{
                let Book_ID = data.null
                if(data){
                    let bulkCreateData = []
                    for(let i of MenuList){
                        bulkCreateData.push({
                            Book_ID: Book_ID,
                            Menu_ID: i,
                        })
                    }
        
                    Bookmenu.bulkCreate(bulkCreateData).then(() => { // 注意: 这里没有凭据, 然而现在你需要...
                        return Bookmenu.findAll({
                            where: {
                                Book_ID: Book_ID
                            }
                        });
                    }).then(Bookmenu => {
                        // if(Bookmenu.length === bulkCreateData.length){
                            res.json(Object.assign(respond, {
                                success: true,
                                data: Bookmenu,
                                messages: '提交成功',
                            }))
                        // }else{
                        //     res.json(Object.assign(respond, {
                        //         data: Bookmenu,
                        //         messages: '提交失败',
                        //     }))
                        // }
                    })
                }else{
                    res.json(Object.assign(respond, {
                        data: data,
                        messages: '提交失败',
                    }))
                }
            }).catch(error=>{
                res.json(Object.assign(respond, {
                    data: error,
                    messages: '数据库写入订单记录异常',
                }))
            })
        }else{
            res.json(Object.assign(respond, {
                messages: '订单不存在',
            }))
        }
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '取订单失败',
        }))
    })
    
})

//修改订单合法性状态
router.get('/UpdateStatus',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = Object.assign({
        // Status: 1,
    }, req.query)

    let check = utils.CheckRequestKey({
        Book_ID: {},
        Status: {
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
    
    
    Book.findOne({
        attributes: ['ID'],
        where: {
            ID: query.Book_ID
        }
    }).then(findOne=>{
        if(findOne){
            Book.update({
                Status: Number(query.Status)
            }, {
                where: {ID: query.Book_ID}
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
                messages: '订单不存在',
            }))
        }
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '数据库查订单是否存在异常',
        }))
    })
})


//修改订单订餐状态
router.get('/UpdateBookStatus',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const query = Object.assign({
        // Status: 1,
    }, req.query)

    let check = utils.CheckRequestKey({
        Book_ID: {},
        BookStatus: {
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
    
    
    Book.findOne({
        attributes: ['ID'],
        where: {
            ID: query.Book_ID
        }
    }).then(findOne=>{
        if(findOne){
            Book.update({
                BookStatus: Number(query.BookStatus)
            }, {
                where: {ID: query.Book_ID}
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
                messages: '订单不存在',
            }))
        }
    }).catch(error=>{
        res.json(Object.assign(respond, {
            data: error,
            messages: '数据库查订单是否存在异常',
        }))
    })
})

module.exports = router