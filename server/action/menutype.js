const express = require('express')
const router = express.Router()

const menutypeFun = require('../model/menutype/fun')

router.get('/getMenuTypeList',(req,res)=>{
    (async ()=>{
        const update = await menutypeFun.getMenuTypeList({attributes: '', where: ''})

        res.send(update)
    })()
})

//添加
router.post('/addMenuType', async (req,res)=>{

    const menutype = await menutypeFun.addMenuType({
        TypeName: req.query.TypeName,
        Summary: req.query.Summary,
    })

    res.send(menutype)
})

//修改
router.post('/updateMenuType', async (req,res)=>{

    const menutype = await menutypeFun.updateMenuType({
        TypeName: req.query.TypeName,
        Summary: req.query.Summary,
        MenuTypeId: req.query.MenuTypeId,
    })

    res.send(menutype)
})



module.exports = router