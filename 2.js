const request = require("request");

let options = {
  url: "https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=QfsujSYaBsuhjodIVPZ1qIDG&client_secret=MWHwwk5dSiPlDRDDyIyGGOfPCgaXu4B3",
  // formData: {
  //   appid: AppID,
  //   secret: AppSecret,
  //   js_code: req.body.code,
  //   grant_type: "authorization_code"
  // }
};
// 向微信服务器发送请求验证用户身份
// request(options, function (err, res, body) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     console.log(body);
//     let token = body.access_token;
//     console.log("--------------------------", token);
//   }
// });

let access_token = "24.9164f3d20116b18dd9e259928a9b0863.2592000.1582297936.282335-18333621"
let base64 = "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";
let options2 = {
  url: `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${access_token}`,
  header: { "Content-Type": "application/x-www-form-urlencoded" },
  method: "POST",
  formData: {
    image: base64
  }
}
request(options2, function (err, res, body) {
  console.log(body);
})