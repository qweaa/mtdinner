const Bookview = require('./index')
const utils = require('../../public/utils')

const model = {
    GetBookviewList(req){
        return new Promise((resolve)=>{
            const query = utils.Assign({
                Current_Page: 1,
                Current_Size: 10,
            }, req.query)

            let check = utils.CheckRequestKey({
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
                resolve(
                    utils.respond({
                        data: check,
                        messages: '参数错误',
                    })
                )
                return
            }

            let Current_Page = Number(query.Current_Page)
            let Current_Size = Number(query.Current_Size)

            Bookview.findAll({
                offset: Current_Size * (Current_Page - 1),
                limit: Current_Size
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
    GetBookviewModel(req){
        return new Promise((resolve)=>{

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
                resolve(
                    utils.respond({
                        data: check,
                        messages: '参数错误',
                    })
                )
                return
            }
            
            Bookview.findOne({
                where: {
                    ID: query.Book_ID
                }
            }).then(BookviewData=>{
                if(BookviewData){
                    resolve(
                        utils.respond({
                            success: true,
                            data: BookviewData,
                            messages: '取订单详情成功',
                        })
                    )
                }else{
                    resolve(
                        utils.respond({
                            messages: '订单不存在',
                        })
                    )
                }
            }).catch(error=>{
                resolve(
                    utils.respond({
                        data: {
                            error,
                            messages: 'GetBookviewModel 服务异常'
                        },
                        messages: '服务器异常',
                    })
                )
            })
        })
    }
}


module.exports = model