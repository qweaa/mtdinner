const express = require('express')
const router = express.Router()
const utils = require('../public/utils')

const BookdayFun = require('../model/bookday/fun')


//取
router.get('/getBookday',(req,res)=>{
    (async ()=>{
        const update = await BookdayFun.getBookday({
            Year: 2019,
            Month: 2,
            Day: 26
        })

        res.send(update)
    })()
})
//add
router.post('/addBookday',(req,res)=>{
    (async ()=>{
        const update = await BookdayFun.addBookday({
            Year: 2019,
            Month: 2,
            Day: 26,
            Store_id: 5,
            BookCount: 24,
            BookNumber: 1,
        })

        res.send(update)
    })()
})


module.exports = router