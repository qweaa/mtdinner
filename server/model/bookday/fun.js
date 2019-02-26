const Bookday = require('./index')
const utils = require('../../public/utils')

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const model = {
    getBookday({Year, Month, Day}){
        return new Promise((resolve)=>{
            let check = utils.CheckRequestKey({
                Year: {
                    isNumber: true,
                },
                Month: {
                    isNumber: true,
                },
                Day: {
                    isNumber: true,
                },
            }, {Year, Month, Day})
            
            if(!check.success){
                resolve(
                    utils.respond({
                        data: check,
                        messages: '参数错误',
                    })
                )
                return
            }

            Bookday.findAll({
                where: {
                    Year: Year,
                    Month: Month,
                    Day: Day,
                }
            }).then(data=>{
                resolve(
                    utils.respond({
                        success: true,
                        data: data,
                        messages: '取订单列表成功',
                    })
                )
            }).catch(error=>{
                resolve(
                    utils.respond({
                        data: error,
                        messages: '取订单列表失败',
                    })
                )
            })
        })
    },
    addBookday({
        Year,
        Month,
        Day,
        Status = 1,
        Store_id,
        BookCount,
        BookNumber,
    }){
        return new Promise((resolve)=>{
            let check = utils.CheckRequestKey({
                Year: {
                    isNumber: true,
                },
                Month: {
                    isNumber: true,
                },
                Day: {
                    isNumber: true,
                },
                Store_id: {
                    isNumber: true,
                },
                BookCount: {
                    isNumber: true,
                },
                BookNumber: {
                    isNumber: true,
                },
            }, {
                Year,
                Month,
                Day,
                Status,
                Store_id,
                BookCount,
                BookNumber,
            })
            
            if(!check.success){
                resolve(
                    utils.respond({
                        data: check,
                        messages: '参数错误',
                    })
                )
                return
            }

            Bookday.create({
                Year: Year,
                Month: Month,
                Day: Day,
                Status: Status,
                Store_id: Store_id,
                BookCount: BookCount,
                BookNumber: BookNumber,
                CreateTime: utils.GetNow()
            }).then(data=>{
                resolve(
                    utils.respond({
                        success: true,
                        data: data,
                        messages: '创建bookday成功',
                    })
                )
            }).catch(error=>{
                resolve(
                    utils.respond({
                        data: error,
                        messages: '创建bookday失败',
                    })
                )
            })
        })
    }
}

module.exports = model