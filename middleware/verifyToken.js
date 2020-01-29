const jwt = require("jsonwebtoken");
const { tokenSecret } = require("../keys/wxconfig");

function verifyToken(req, res, next) {
  let token = req.get("Authorization");
  // 去掉tokne中的Bearer再进行验证
  jwt.verify(token.split(' ')[1], tokenSecret, function (err, decoded) {
    if (err) {
      return res.json({ code: 1, msg: err });
    }
    req.payload = decoded;
    next();
  })
};

module.exports = verifyToken;