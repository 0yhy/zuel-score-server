const jwt = require("jsonwebtoken");
const { tokenSecret } = require("../wxconfig");

function verifyToken(req, res, next) {
  // console.log("token:", req.get("Authorization"))
  let token = req.get("Authorization");
  // 我是憨憨啊憨憨啊一直忘记把Bearer去掉就验证了我佛了
  jwt.verify(token.split(' ')[1], tokenSecret, function (err, decoded) {
    if (err) {
      return res.json({ code: 1, msg: err });
    }
    // console.log("============token验证成功");
    // console.log(decoded);
    req.payload = decoded;
    next();
  })
};

module.exports = verifyToken;