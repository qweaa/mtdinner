const express = require('express')
const router = express.Router()
const conn = require('../model')
const resp = require('../config').respond
const utils = require('../public/utils')

//取用户列表
router.get('/GetUserList',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const data = req.query

    const Current_Page = data.Current_Page || 1
    const Current_Size = data.Current_Size || 10

    conn.query(`SELECT * from User limit ${Current_Size} offset  ${Current_Size * (Current_Page - 1)}`, function (error, results, fields) {
        if (!error){
            res.json(Object.assign(respond, {
                success: true,
                data: results,
                messages: '取用户列表成功',
            }))
        }else{
            res.json(Object.assign(respond, {
                data: error,
                messages: '取用户列表失败',
            }))
        }
    });
})
//取用户详细信息
router.get('/GetUserModel',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const data = req.query

    if(!data.User_ID){
        res.json(Object.assign(respond, {
            messages: '请传入User_ID的值',
        }))
        return
    }

    conn.query(`SELECT * from USER WHERE ID = ${data.User_ID} limit 1`, function (error, results, fields) {
        if (!error){
            if(results.length){
                res.json(Object.assign(respond, {
                    success: true,
                    data: results[0],
                    messages: '取用户列表成功',
                }))
            }else{
                res.json(Object.assign(respond, {
                    messages: '用户不存在',
                }))
            }
        }else{
            res.json(Object.assign(respond, {
                data: error,
                messages: '取用户列表失败',
            }))
        }
    });
})

//注册用户
router.get('/Register',(req,res)=>{
    const respond = JSON.parse(JSON.stringify(resp))

    const data = req.query

    let check = utils.CheckRequestKey({
        NickName: {
            regexp: (value)=>{
                if(utils.regexp.HasIllegalSign(value)){
                    return '昵称不得含有非法字符'
                }
            }
        },
        UserName: {
            regexp: (value)=>{
                if(!utils.regexp.IsChineseName(value)){
                    return '请使用中文名字'
                }
            }
        },
        Password: {
            regexp: (value)=>{
                if(utils.regexp.HasIllegalSign(value)){
                    return '密码不得含有非法字符'
                }
            }
        }
    }, data)
    
    // if(!data.NickName){
    //     res.json(Object.assign(respond, {
    //         messages: '昵称不能为空',
    //     }))
    //     return
    // }

    // if(!data.UserName){
    //     res.json(Object.assign(respond, {
    //         messages: '用户姓名不能为空',
    //     }))
    //     return
    // }
    
    // if(!data.Password){
    //     res.json(Object.assign(respond, {
    //         messages: '密码不能为空',
    //     }))
    //     return
    // }

    if(!check.success){
        res.json(Object.assign(respond, {
            data: check,
            messages: '参数错误',
        }))
        return
    }
    
    res.json(Object.assign(respond, {
        data: check,
        messages: '参数错误',
    }))
    return

    conn.query(`SELECT ID from user WHERE NickName = ${data.NickName} limit 1`, function (error, results, fields) {
        if (!error){
            if(results.length){
                res.json(Object.assign(respond, {
                    messages: '昵称“' + data.NickName + '”已存在',
                }))
            }else{
                const now = new Date().toLocaleString('chinese', {hour12: false})
                const ip = utils.GetRequestIp(req)
                //注册
                const  addSql = 'INSERT INTO USER(NickName,UserName,Password,DefaultIP,CreateTime) VALUES(?,?,?,?,?)';
                const  addSqlParams = [data.NickName, data.UserName, data.Password,ip,now];
                conn.query(addSql,addSqlParams,function (err, result) {
                    if(!err){
                        res.json(Object.assign(respond, {
                            success: true,
                            data: result,
                            messages: '注册成功',
                        }))
                    }else{
                        res.json(Object.assign(respond, {
                            data: err,
                            messages: '注册失败 ',
                        }))
                    }
                });
            }
        }else{
            res.json(Object.assign(respond, {
                data: error,
                messages: '取学生信息详情失败',
            }))
        }
    });

})

module.exports = router