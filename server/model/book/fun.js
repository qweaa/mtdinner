const Book = require('./index')
const utils = require('../../public/utils')

const model = {
    //添加订单
    AddBook(req){
        return new Promise((resolve)=>{
            const query = utils.Assign({
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
                Store_ID: {
                    regexp: (value)=>{
                        if(!utils.regexp.IsNumber(value)){
                            return 'Store_ID 参数错误.Number'
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
                TotalPrice: {}
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

            Book.create({
                Status: Number(query.Status),
                BookStatus: Number(query.BookStatus),
                MenuList: query.MenuList,
                Remark: query.Remark,
                Year: utils.GetYear(),
                Month: utils.GetMonth(),
                Day: utils.GetDay(),
                User_ID: Number(query.User_ID),
                Store_ID: Number(query.Store_ID),
                CreateTime: utils.GetNow(),
                TotalPrice: query.TotalPrice,
            }).then(data=>{
                if(data){
                    data.dataValues.ID = data.null
                    resolve(
                        utils.respond({
                            success: true,
                            data: data,
                            messages: '添加成功',
                        })
                    )
                }else{
                    resolve(
                        utils.respond({
                            data: data,
                            messages: '添加失败',
                        })
                    )
                }
            }).catch(error=>{
                resolve(
                    utils.respond({
                        data: {
                            error,
                            messages: 'model AddBook fun error: 服务异常'
                        },
                        messages: '服务器异常',
                    })
                )
            })
        })
    },
}


module.exports = model