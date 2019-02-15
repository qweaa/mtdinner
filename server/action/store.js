const express = require('express')
const router = express.Router()
const utils = require('../public/utils')

const rulesFun = require('../model/rules/fun')
const storeFun = require('../model/store/fun')

//取店铺列表
router.get('/GetStoreList',(req,res)=>{
    (async ()=>{
        const store = await storeFun.GetStoreList(req)
        res.json(store)
    })()
})

//取店铺详细信息
router.get('/GetStoreModel',(req,res)=>{
    (async ()=>{
        const store = await storeFun.GetStoreModel(req)
        res.json(store)
    })()
})

//添加店铺
router.post('/AddStore',(req,res)=>{
    (async ()=>{
        const store = await storeFun.AddStore(req)
        res.json(store)
    })()
})

//禁用店铺
router.post('/UpdateStatus',(req,res)=>{
    (async ()=>{
        const query = req.query
        if(Number(query.Status) === 0){
            let rules = await rulesFun.GetRules()

            if(!rules.success){
                res.json(rules)
                return
            }

            if(rules.data && rules.data.ActiveStoreID == query.Store_ID){
                res.json(utils.respond({
                    data: rules,
                    messages: '不能禁用正在使用的店铺',
                }))
                return
            }
        }

        let store = await storeFun.UpdateStatus(req)
        res.json(store)
        
    })()
})

//修改店铺信息
router.post('/UpdateStore', (req, res)=>{
    (async ()=>{
        const store = await storeFun.UpdateStore(req)
        res.json(store)
    })()
})

module.exports = router