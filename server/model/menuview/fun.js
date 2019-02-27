const Menu = require('./index')
const utils = require('../../public/utils')

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

function GetMenuList({attributes, where, noType}){
    return new Promise((resolve)=>{
        Menu.findAll({
            attributes: attributes,
            where: where
        }).then(MenuData=>{
            if(MenuData){
                let data = []
                let MenuTypeIds = []
                if(noType){
                    data = MenuData
                }else{
                    for(let i of MenuData){
                        if(!data.length || !MenuTypeIds.includes(i.MenuType_ID)){
                            data.push({
                                MenuType: i.TypeName,
                                MenuType_ID: i.MenuType_ID,
                                MenuTypeSummary: i.MenuTypeSummary,
                                Menus: [i]
                            })
                            MenuTypeIds.push(i.MenuType_ID)
                        }else{
                            for(let j of data){
                                if(j.MenuType_ID === i.MenuType_ID){
                                    j.Menus.push(i)
                                }
                            }
                        }
                    }
                }

                resolve(
                    utils.respond({
                        success: true,
                        data: data,
                        messages: '取订单菜单列表成功',
                    })
                )
            }else{
                resolve(
                    utils.respond({
                        data: MenuDatam,
                        messages: '取订单菜单列表失败',
                    })
                )
            }
        }).catch(error=>{
            resolve(
                utils.respond({
                    data: {
                        error,
                        messages: 'GetMenuListByIds 服务异常'
                    },
                    messages: '服务异常',
                })
            )
        })
    })
}

const model = {
    GetMenuListByIds(MenuList){
        return new Promise((resolve)=>{

            if(!utils.regexp.isArray(MenuList)){
                resolve(
                    utils.respond({
                        messages: 'MenuList 参数格式错误.Array',
                    })
                )
                return
            }
            
            for(let i of MenuList){
                if(!utils.regexp.IsNumber(i)){
                    resolve(
                        utils.respond({
                            messages: 'MenuList 参数格式错误.Array.Number',
                        })
                    )
                    return
                }
            }

            (async ()=>{
                let menus = await GetMenuList({
                    attributes: { exclude: ['CreateTime'] },
                    where: {
                        ID: {
                            [Op.in]: MenuList,
                        }
                    },
                    noType: 1,
                })
                
                resolve(menus)
            })()
        })
    },
    GetMenuListByStoreid(Store_ID){
        return new Promise((resolve)=>{

            if(!utils.regexp.IsNumber(Store_ID)){
                resolve(
                    utils.respond({
                        messages: 'Store_ID 参数格式错误.Number',
                    })
                )
                return
            }

            (async ()=>{
                let menus = await GetMenuList({
                    attributes: { exclude: ['CreateTime'] },
                    where: {
                        Store_ID: Store_ID
                    }
                })
                
                resolve(menus)
            })()
        })
    },
    GetMenuListPriceByIds(MenuList){
        return new Promise((resolve)=>{

            if(!utils.regexp.isArray(MenuList)){
                resolve(
                    utils.respond({
                        messages: 'MenuList 参数格式错误.Array',
                    })
                )
                return
            }
            
            for(let i of MenuList){
                if(!utils.regexp.IsNumber(i)){
                    resolve(
                        utils.respond({
                            messages: 'MenuList 参数格式错误.Array.Number',
                        })
                    )
                    return
                }
            }

            (async ()=>{
                let menus = await GetMenuList({
                    attributes: ['Price'],
                    where: {
                        ID: {
                            [Op.in]: MenuList,
                        }
                    },
                    noType: 1,
                })
                
                resolve(menus)
            })()
        })
    }
}


module.exports = model