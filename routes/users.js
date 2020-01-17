const express = require('express');
const router = express.Router();

const request = require("request");
const jwt = require("jsonwebtoken");

// 该文件里存放了appid和appsecret
const { AppID, AppSecret, tokenSecret } = require("../wxconfig");
const { UserModel } = require("../db/models");

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// 校验appid与appsecret，获取session_key 以及 openid
router.post("/checkuser", function (req, res, next) {
  if (req.body.code) {
    let options = {
      method: "POST",
      url: "https://api.weixin.qq.com/sns/jscode2session?",
      formData: {
        appid: AppID,
        secret: AppSecret,
        js_code: req.body.code,
        grant_type: "authorization_code"
      }
    };
    // 向微信服务器发送请求验证用户身份
    request(options, function (err, requestRes, body) {
      if (err) {
        console.log("errrrrrr!");
        res.json({
          "code": 1,
          "msg": "error"
        });
      }
      else {
        const { openid, session_key } = JSON.parse(body);
        // 签发jwt
        const payload = {
          openid: openid
        };
        let token = jwt.sign(payload, tokenSecret, { expiresIn: "2 days" });
        res.send({ code: 0, data: token });

        // 数据库查找用户
        UserModel.findOne({ openid: openid }, function (err, user) {
          // 用户第一次登陆
          if (!user) {
            new UserModel({ openid: openid, session_key: session_key }).save(function (err, newuser) {
              console.log(newuser);
            })
          }
          else {
            console.log("user existed");
          }
        });
      }
    });
  }
});

module.exports = router;
