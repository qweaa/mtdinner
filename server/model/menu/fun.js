const Menu = require('./index')
const utils = require('../../public/utils')

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

function GetMenuList({attributes, where}){
    return new Promise((resolve)=>{
        Menu.findAll({
            attributes: attributes,
            where: where
        }).then(MenuData=>{
            if(MenuData){
                resolve(
                    utils.respond({
                        success: true,
                        data: MenuData,
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
                    }
                })
                
                resolve(menus)
            })()
        })
    }
}


module.exports = model