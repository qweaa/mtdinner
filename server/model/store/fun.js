const storeModel = require('./index')
const utils = require('../../public/utils')

module.exports = {
    GetStoreModel(req){

        return new Promise((resolve)=>{
            
            const query = req.query
    
            let check = utils.CheckRequestKey({
                Store_ID: {
                    regexp: (value)=>{
                        if(!utils.regexp.IsNumber(value)){
                            return 'Store_ID 参数错误.Number'
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
    
            storeModel.findOne({
                where: {
                    ID: query.Store_ID
                }
            }).then(data=>{
                if(data){
                    resolve(
                        utils.respond({
                            success: true,
                            data: data,
                            messages: '取店铺详情信息成功',
                        })  
                    )
                }else{
                    resolve(
                        utils.respond({
                            messages: '店铺不存在',
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
    GetStoreList(req){
        return new Promise((resolve)=>{
            const query = utils.Assign({
                Current_Page: 1,
                Current_Size: 10,
                Status: false,                  //未传入为false，则请求所有状态的店铺
            }, req.query)
        
            let check = utils.CheckRequestKey({
                Status: {
                    regexp: (value)=>{
                        if(value === false) return
        
                        if(!utils.regexp.IsNumber(value)){
                            return 'Store_ID 参数错误.Number'
                        }
                    }
                },
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
                resolve(
                    utils.respond({
                        data: check,
                        messages: '参数错误',
                    })
                )
                return
            }
        
            let where = {}
        
            if(query.Status !== false){
                let Status = Number(query.Status)
                if(Status === 0 || Status === 1) {
                    where.Status = query.Status
                }
            }
        
            let Current_Page = Number(query.Current_Page)
            let Current_Size = Number(query.Current_Size)
        
            storeModel.findAll({
                offset: Current_Size * (Current_Page - 1),
                limit: Current_Size,
                where: where
            }).then(data=>{
                resolve(
                    utils.respond({
                        success: true,
                        data: data,
                        messages: '取店铺列表成功',
                    })
                )
            }).catch(error=>{
                resolve(
                    utils.respond({
                        data: error,
                        messages: '取店铺列表错误',
                    })
                )
            })

        })
    },
    AddStore(req){
        return new Promise((resolve)=>{

            const query = utils.Assign({
                Status: 1,
            }, req.query)

            let check = utils.CheckRequestKey({
                StoreName: {},
                Phones: {
                    regexp: (value)=>{
                        let arr = value.split(',')
                        for(let i of arr){
                            if(!utils.regexp.IsNumber(i)){
                                return 'Phones 参数错误'
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

            storeModel.create({
                StoreName: query.StoreName,
                Status: Number(query.Status),
                WeChat: query.WeChat,
                Phones: query.Phones,
                Address: query.Address,
                CreateTime: utils.GetNow(),
            }).then(data=>{
                if(data){
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
                            messages: '添加失败',
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
    UpdateStatus(req){
        return new Promise((resolve) => {
            const query = req.query

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
                        if(!utils.regexp.IsNumber(value)){
                            return 'Status 参数错误.Number'
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

            storeModel.findOne({
                attributes: ['ID'],
                where: {
                    ID: query.Store_ID
                }
            }).then(findOne=>{
                if(findOne){
                    storeModel.update({
                        Status: Number(query.Status)
                    }, {
                        where: {ID: query.Store_ID}
                    }).then(update => {
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
                                data: err,
                                messages: '设置失败',
                            })
                        )
                    })
                }else{
                    resolve(
                        utils.respond({
                            messages: '店铺不存在',
                        })
                    )
                }
            }).catch(error=>{
                resolve(
                    utils.respond({
                        data: error,
                        messages: '数据库查店铺是否存在异常',
                    })
                )
            })
        })
    },
    UpdateStore(req){
        return new Promise((resolve)=>{

            const query = utils.Assign({
                Status: null,
            }, req.query)

            let check = utils.CheckRequestKey({
                Store_ID: {
                    regexp: (value)=>{
                        if(!utils.regexp.IsNumber(value)){
                            return 'Store_ID 参数错误'
                        }
                    }
                },
                StoreName: {},
                Phones: {
                    regexp: (value)=>{
                        let arr = value.split(',')
                        for(let i of arr){
                            if(!utils.regexp.IsNumber(i)){
                                return 'Phones 参数错误'
                            }
                        }
                    }
                },
                Status: {
                    regexp: (value)=>{
                        if(value === null) return
                        if(!utils.regexp.IsNumber(value)){
                            return 'Status 参数错误.Number'
                        }
                    }
                }
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

            storeModel.findOne({
                attributes: ['ID'],
                where: {
                    ID: query.Store_ID
                }
            }).then(findOne=>{
                if(findOne){
                    storeModel.update({
                        StoreName: query.StoreName,
                        WeChat: query.WeChat,
                        Phones: query.Phones,
                        Address: query.Address,
                        Status: query.Status,
                        UpdateTime: utils.GetNow(),
                    }, {
                        where: {ID: query.Store_ID}
                    }).then(update=>{
                        resolve(
                            utils.respond({
                                success: true,
                                data: update,
                                messages: '修改店铺信息成功',
                            })
                        )
                    }).catch(err=>{
                        resolve(
                            utils.respond({
                                data: err,
                                messages: '修改店铺信息错误',
                            })
                        )
                    })
                }else{
                    resolve(
                        utils.respond({
                            data: err,
                            messages: '店铺不存在',
                        })
                    )
                }
            }).catch((err)=>{
                resolve(
                    utils.respond({
                        data: err,
                        messages: '查询店铺错误',
                    })
                )
            })
        })
    },
}