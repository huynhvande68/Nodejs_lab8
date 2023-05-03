const express = require('express');
const Router = express.Router();
const {validationResult} = require('express-validator')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const Account = require('../models/AccountModel');

const registerValidator = require('./validators/registerValidator')

Router.get('/', (req, res) => {
    res.json({
        code: 0,
        message: 'Account router'
    })
})

Router.post('/login', (req, res) => {
    let result = validationResult(req);
    if (result.errors.length === 0) {
        let {email, password } = req.body;

        let account = undefined;
        Account.findOne({email: email})
        .then(acc => {
            if(!acc){
                throw new Error('Email không tồn tại')
            }
            account = acc
            return bcrypt.compare(password, acc.password)
        })
        .then(passwordMatch => {
            if(!passwordMatch){
                return res.status(401).json({code: 3, message: 'Đăng nhập thất bại, mật khẩu không chính xác ' });
            }
            //return res.status(200).json({code: 0, message: 'Đăng nhập thành công'});

            const {JWT_SECRET} = process.env
            jwt.sign({
                email: account.email,
                fullname: account.fullname
            },JWT_SECRET, {
                expiresIn: '1h'
            },(err, token) => {
                if(err) throw err

               return res.json({
                    code: 0,
                    message: 'Đăng nhậpt thành công',
                    token: token
                })
            })
        })
        .catch(e => {
            return res.status(401).json({code: 2, message: 'Đăng nhập thất bại: ' + e.message});
        })
    }
    
    
    else{
        let messages = result.mapped();
        let message = ''
        for(m in messages){
            message = messages[m].msg;
            break
        }

        return res.json({code: 1, message: message})
    }
})

Router.post('/register', registerValidator, (req, res) => {
    let result = validationResult(req); 
    if (result.errors.length === 0) {

        let {email, password, fullname} = req.body;
        Account.findOne({email: email})
        .then(acc => {
            if(acc){
                throw new Error('Tài khoản này đã tồn tại (email)')
            }
        })
        .then(() => bcrypt.hash(password, 10))  
        .then(hashed => {
            let user = new Account({
                email: email,
                password: hashed,
                fullname: fullname
            })
            
            user.save().then(() => {
                return res.json({code: 0, message: 'Đăng kí tài khoản thành công' })
            }).catch(e => {
                return res.json({code: 2, message: 'Đăng kí tài khoản thất bại: ' + e.message})
            })
        })
        
    }else{
        let messages = result.mapped();
        let message = ''
        for(m in messages){
            message = messages[m].msg;
            break
        }

        return res.json({code: 1, message: message})
    }
    
})

module.exports = Router