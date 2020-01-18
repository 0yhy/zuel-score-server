const express = require('express');
const router = express.Router();

const request = require("request");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");

// 该文件里存放了appid和appsecret
const { AppID, AppSecret, tokenSecret } = require("../wxconfig");
const { UserModel, ScoreModel, AdviceModel } = require("../db/models");

// 获取用户列表
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

// 获取用户身份验证情况
router.get("/isverified", verifyToken, function (req, res, next) {
  console.log(req.payload);
  const openid = req.payload.openid;
  console.log(openid);
  UserModel.findOne({ openid }, function (err, user) {
    if (err) {
      res.send({ code: 1, msg: err });
    }
    else {
      if (user) {
        res.send({ code: 0, data: user.isverified });
      }
    }
  });
});

// 获取用户所有填写过的成绩
router.get("/myscore", verifyToken, function (req, res, next) {
  const openid = req.payload.openid;
  const filter = { openid: 0, __v: 0, course_id: 0 };//过滤指定属性（这里为密码和自带的_v）

  ScoreModel.find({ openid }, filter, function (err, scores) {
    if (!scores) {
      res.send({ code: 0, data: "暂无成绩" });
    }
    else {
      res.send({ code: 0, data: scores });
    }
  });
});

// 用户意见反馈
router.post("/advice", verifyToken, function (req, res, next) {
  const openid = req.payload.openid;
  const advice = req.body.advice;
  UserModel.findOne({ openid }, function (err, user) {
    if (user.student_id) {
      new AdviceModel({ openid, advice, student_id: user.student_id }).save(function (err, newadvice) {
        res.send({ code: 0, data: "ok" });
      });
    }
    else {
      new AdviceModel({ openid, advice }).save(function (err, newadvice) {
        res.send({ code: 0, data: "ok" });
      });
    }
  });
});

module.exports = router;
