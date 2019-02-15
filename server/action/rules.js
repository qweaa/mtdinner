const express = require('express')
const router = express.Router()

const rulesFun = require('../model/rules/fun')


//修改规则
router.post('/UpdateRules',(req,res)=>{
    (async ()=>{
        const update = await rulesFun.UpdateRules(req)

        res.send(update)
    })()
})

//取规则信息
router.get('/GetRules',(req,res)=>{
    (async ()=>{
        const update = await rulesFun.GetRules(req)

        res.send(update)
    })()
})


module.exports = router