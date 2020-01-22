const express = require('express');
const router = express.Router();

const request = require("request");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");

const { Builder, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

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
        let token = jwt.sign(payload, tokenSecret);
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

router.post("/verify", verifyToken, function (req, res, next) {
  const { username, password } = req.body;
  let loginFlag = false;
  let options = new chrome.Options().addArguments("window-size=1920*3000");
  (async () => {
    let browser = await new Builder().setChromeOptions(options).forBrowser("chrome").build()
      .catch(err => console.log("1", err));
    try {
      await browser.get("http://ids.zuel.edu.cn/authserver/login?service=http%3A%2F%2F202.114.234.75%2Fjsxsd%2Fframework%2FxsMain.jsp%3Bjsessionid%3D58591E596B59E4B0F583CD84BF8D9C93")
        .catch(err => console.log("1", err));
      let loginForm = await browser.findElement({ id: "casLoginForm" })
        .catch(err => console.log("2", err));
      await loginForm.findElement({ id: "username" }).sendKeys(username)
        .catch(err => console.log("3", err));
      await loginForm.findElement({ id: "password" }).sendKeys(password)
        .catch(err => console.log("4", err));
      let captchaImg = await loginForm.findElement({ id: "captchaImg" })
        .catch(err => console.log(err));
      await (async () => {
        if (captchaImg) {
          console.log("I've confirmed that cpatcha exsisted\n")
          await captchaImg.takeScreenshot()
            .then((screenshot) => {
              console.log("I have taken a screenshot");
              res.send({ code: 0, captchaBase64: screenshot });
            })
            .catch(err => { console.log(err) });
          router.get("/verify", verifyToken, async function (req, res, next) {
            await loginForm.findElement({ id: "captchaResponse" }).sendKeys(req.query.captcha)
              .catch(err => console.log(err));
            await loginForm.findElement({ className: "auth_login_btn" }).click()
              .catch(err => console.log("5555555555555", err));
            await browser.getTitle()
              .then((curtitle) => {
                if (curtitle == "教学一体化服务平台") {
                  loginFlag = true;
                }
                res.send({ code: 0, isverified: loginFlag });
                browser.quit();
              })
              .catch(err => console.log(err));
          });
        }
        else {
          await loginForm.findElement({ className: "auth_login_btn" }).click()
            .then(() => { console.log("I clicked login") })
            .catch(err => console.log("5", err));
          await browser.getTitle()
            .then((curtitle) => {
              console.log(curtitle);
              if (curtitle == "教学一体化服务平台") {
                loginFlag = true;
              }
              console.log("true");
              res.send({ code: 0, isverified: loginFlag });
              browser.quit();
            })
            .catch(err => console.log(err));
        }
      })();
    }
    catch {
      browser.quit();
    }
  })();
});

module.exports = router;
