const Bookmenu = require('./index')
const utils = require('../../public/utils')

const model = {
    AddBookmenu(bulkCreateData){
        return new Promise((resolve)=>{
            if(!utils.regexp.isArray(bulkCreateData)){
                resolve(
                    utils.respond({
                        data: 'bookmenu fun AddBookview error: bulkCreateData 参数错误.Array',
                        messages: '服务异常'
                    })
                )
            }

            for(let i of bulkCreateData){
                if(!utils.regexp.IsNumber(i.Book_ID) || !utils.regexp.IsNumber(i.Menu_ID)){
                    resolve(
                        utils.respond({
                            data: 'bookmenu fun AddBookview error: bulkCreateData.Book_ID or bulkCreateData.Menu_ID 参数错误.Number',
                            messages: '服务异常'
                        })
                    )
                    return
                }
            }

            Bookmenu.bulkCreate(bulkCreateData).then(() => { // 注意: 这里没有凭据, 然而现在你需要...
                Bookmenu.findAll({
                    where: {
                        Book_ID: bulkCreateData[0].Book_ID
                    }
                }).then(Bookmenu => {
                    if(Bookmenu){
                        resolve(
                            utils.respond({
                                success: true,
                                data: Bookmenu,
                                messages: '添加 Bookmenu 成功',
                            })
                        )
                    }else{
                        resolve(
                            utils.respond({
                                data: Bookmenu,
                                messages: '添加 Bookmenu 失败',
                            })
                        )
                    }
                });
            })

        })
    }
}


module.exports = model