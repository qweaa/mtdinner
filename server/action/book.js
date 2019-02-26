const express = require('express')
const router = express.Router()
const resp = require('../config').respond
const utils = require('../public/utils')

const BookviewFun = require('../model/bookview/fun')
const MenuFun = require('../model/menu/fun')
const BookFun = require('../model/book/fun')
const Book = require('../model/book/index')
const Bookview = require('../model/bookview/index')

//取订单列表
router.get('/GetBookList',(req,res)=>{
    (async ()=>{
        let list = await BookviewFun.GetBookviewList(req)
        res.json(list)
    })()
})

//根据日期取订单列表
router.get('/GetBookListByDay',(req,res)=>{
    const query = utils.Assign({
        Current_Page: 1,
        Current_Size: 10,
    }, req.query)

    let check = utils.CheckRequestKey({
        Day: {},
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
        res.json(
            utils.respond({
                data: check,
                messages: '参数错误',
            })
        )
        return
    }

    let date = new Date(query.Day);

    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()

    if(isNaN(year)){
        res.json(
            utils.respond({
                data: query.Day,
                messages: 'Day值错误，请传入时间值',
            })
        )
        return
    }

    let Current_Page = Number(query.Current_Page)
    let Current_Size = Number(query.Current_Size)

    Bookview.findAll({
        offset: Current_Size * (Current_Page - 1),
        limit: Current_Size,
        where: {
            Year: year,
            Month: month,
            Day: day,
        }
    }).then(data=>{
        res.json(
            utils.respond({
                success: true,
                data: data,
                messages: '取订单列表成功',
            })
        )
    }).catch(error=>{
        res.json(
            utils.respond({
                data: error,
                messages: '取订单列表失败',
            })
        )
    })
})

//取订单详细信息
router.get('/GetBookDetail',(req,res)=>{
    (async ()=>{
        const BookviewData = await BookviewFun.GetBookviewModel(req)

        if(!BookviewData.success){
            res.json(BookviewData)
            return
        }

        const MenuIdList = BookviewData.data.MenuList.split(',')

        const MenuData = await MenuFun.GetMenuListByIds(MenuIdList)

        if(!MenuData.success){
            res.json(MenuData)
            return
        }

        BookviewData.data.dataValues.MenuData = MenuData
        
        res.json(BookviewData)

    })()
})

//提交订单
router.post('/SubmitBook',(req,res)=>{
    (async ()=>{
        if(!req.query || !req.query.MenuList){
            res.json(
                utils.respond({
                    data: '请传入MenuList',
                    messages: '参数错误',
                })
            )
        }
        let MenuData = await MenuFun.GetMenuListPriceByIds(req.query.MenuList.split(','))

        if(!MenuData.success){
            res.json(MenuData)
            return
        }
        
        let TotalPrice = 0
        for(let i of MenuData.data){
            TotalPrice += i.Price
        }

        req.query.TotalPrice = TotalPrice

        let BookData = await BookFun.AddBook(req)

        res.json(BookData)

    })()
})

//修改订单合法性状态
router.post('/UpdateStatus',(req,res)=>{
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
    
    
    Book.findOne({
        attributes: ['ID'],
        where: {
            ID: query.Book_ID
        }
    }).then(findOne=>{
        if(findOne){
            Book.update({
                Status: Number(query.Status),
                UpdateTime: utils.GetNow(),
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
router.post('/UpdateBookStatus',(req,res)=>{
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
        BookStatus: {
            regexp: (value)=>{
                if(!utils.regexp.IsNumber(value)){
                    return 'BookStatus 参数错误.Number'
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
                BookStatus: Number(query.BookStatus),
                BookTime: utils.GetNow(),
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