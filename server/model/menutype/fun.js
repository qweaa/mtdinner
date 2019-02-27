const Menutype = require('./index')
const utils = require('../../public/utils')

function getMenuTypeList({attributes, where}){
    return new Promise((resolve)=>{
        Menutype.findAll({attributes, where}).then(MenuData=>{
            if(MenuData){
                resolve(
                    utils.respond({
                        success: true,
                        data: MenuData,
                        messages: '取订单菜单类型列表成功',
                    })
                )
            }else{
                resolve(
                    utils.respond({
                        data: MenuDatam,
                        messages: '取订单菜单类型列表失败',
                    })
                )
            }
        }).catch(error=>{
            resolve(
                utils.respond({
                    data: {
                        error,
                        messages: 'getMenuTypeList 服务异常'
                    },
                    messages: '服务异常',
                })
            )
        })
    })
}

const model = {
    getMenuTypeList,
    addMenuType({TypeName, Summary}){
        return new Promise((resolve)=>{
            if(!TypeName){
                resolve(
                    utils.respond({
                        data: {TypeName, Summary},
                        messages: '参数不能为空',
                    })
                )
                return
            }

            (async ()=>{
                let menus = await getMenuTypeList({
                    attributes: ['ID'],
                    where: {
                        TypeName: TypeName,
                    }
                })

                if(!menus.success){
                    resolve(menus)
                    return
                }

                if(menus.data.length){
                    resolve(
                        utils.respond({
                            data: menus.data,
                            messages: '菜单分类名已存在',
                        })
                    )
                    return
                }

                Menutype.create({
                    TypeName: TypeName,
                    Summary: Summary,
                    CreateTime: utils.GetNow(),
                }).then(data=>{
                    resolve(data)
                }).catch(err=>{
                    resolve(
                        utils.respond({
                            data: err,
                            messages: 'addMenuType 服务异常',
                        })
                    )
                })
                
            })()
        })
    },
    updateMenuType({TypeName, Summary, MenuTypeId}){
        return new Promise((resolve)=>{
            if(!TypeName || !MenuTypeId){
                resolve(
                    utils.respond({
                        data: {TypeName, Summary},
                        messages: '参数不能为空',
                    })
                )
                return
            }

            (async ()=>{
                let menus = await getMenuTypeList({
                    attributes: ['ID'],
                    where: {
                        TypeName: TypeName,
                    }
                })

                if(!menus.success){
                    resolve(menus)
                    return
                }

                if(!menus.data.length){
                    resolve(
                        utils.respond({
                            data: menus.data,
                            messages: '菜单分类名不存在',
                        })
                    )
                    return
                }

                Menutype.update({
                    TypeName: TypeName,
                    Summary: Summary,
                    UpdateTime: utils.GetNow(),
                }, {
                    where: {ID: MenuTypeId}
                }).then(data=>{
                    resolve(data)
                }).catch(err=>{
                    resolve(
                        utils.respond({
                            data: err,
                            messages: 'updateMenuType 服务异常',
                        })
                    )
                })
                
            })()
        })
    }
}

module.exports = model