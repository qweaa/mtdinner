const rulesModel = require('./index')
const utils = require('../../public/utils')

const model = {
    //取规则信息
    GetRules(){
        return new Promise((resolve)=>{
            rulesModel.findOne().then(data=>{
                if(data){
                    resolve(
                        utils.respond({
                            success: true,
                            data: data,
                            messages: '取规则信息成功',
                        })
                    )
                }else{
                    resolve(
                        utils.respond({
                            messages: '取规则信息失败',
                        })
                    )
                }
            }).catch(error=>{
                resolve(
                    utils.respond({
                        data: error,
                        messages: '服务器异常',
                    })
                )
            })
        })
    },
    //修改规则
    UpdateRules(req){
        return new Promise((resolve)=>{

            const query = utils.Assign({
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
                resolve(
                    utils.respond({
                        data: check,
                        messages: '参数错误',
                    })
                )
                return
            }
            
            rulesModel.findOne({
                attributes: ['ID'],
                where: {
                    ID: 0
                }
            }).then(findOne=>{
                if(findOne){
                    rulesModel.update({
                        MaxCost: Number(query.MaxCost),
                        ActiveStoreID: Number(query.ActiveStoreID),
                    }, {
                        where: {ID: 0}
                    }).then(update=>{
                        resolve(
                            utils.respond({
                                success: true,
                                data: update,
                                messages: '设置成功',
                            })
                        )
                    }).catch(err=>{
                        resolve(
                            utils.respond({
                                data: {
                                    error: err,
                                    messages: '1-1 更新规则异常'
                                },
                                messages: '服务器异常',
                            })
                        )
                    })
                }else{
                    rulesModel.create({
                        MaxCost: Number(query.MaxCost),
                        ActiveStoreID: Number(query.ActiveStoreID),
                    }).then(data=>{
                        if(data){
                            resolve(
                                utils.respond({
                                    success: true,
                                    data: data,
                                    messages: '设置成功',
                                })
                            )
                        }else{
                            resolve(
                                utils.respond({
                                    data: data,
                                    messages: '设置失败',
                                })
                            )
                        }
                    }).catch(error=>{
                        resolve(
                            utils.respond({
                                data: {
                                    error: error,
                                    messages: '1-2 新增规则异常'
                                },
                                messages: '服务器异常',
                            })
                        )
                    })
                }
            }).catch(error=>{
                resolve(
                    utils.respond({
                        data: {
                            error: error,
                            messages: '1 新增规则异常'
                        },
                        messages: '服务器异常',
                    })
                )
            })
        })
    }
}


module.exports = model