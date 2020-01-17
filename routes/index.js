const express = require('express');
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

const { TeacherModel, CourseModel, LikeModel, DislikeModel } = require("../db/models");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

//获取课程列表
router.get("/course", verifyToken, function (req, res, next) {
  // console.log(req);
  CourseModel.find({}, function (err, courses) {
    res.send({ code: 0, data: courses });
  })
});

// 获取课程详情
router.get("/course/detail", verifyToken, function (req, res, next) {
  const { course_name, teacher_name } = req.query;
  CourseModel.findOne({ course_name: course_name, teacher_name: teacher_name }, function (err, course) {
    res.send({ code: 0, data: course });
  })
});

// 获取课程点赞与否
router.get("/course/like", verifyToken, function (req, res, next) {
  let openid = req.payload.openid;
  let course_id = req.query.course_id;
  LikeModel.findOne({ openid: openid, course_id: course_id }, function (err, like) {
    if (!err) {
      let islike;
      if (like) {
        islike = like.islike;
      }
      else {
        islike = false;
      }
      LikeModel.where({ course_id: course_id, islike: true }).count(function (err, cnt) {
        res.send({
          code: 0, data: {
            islike: islike,
            like_count: cnt
          }
        });
        console.log("cnt:", cnt);
      })
    }
  });
});
// 获取课程不喜欢与否
router.get("/course/dislike", verifyToken, function (req, res, next) {
  let openid = req.payload.openid;
  let course_id = req.query.course_id;
  DislikeModel.findOne({ openid: openid, course_id: course_id }, function (err, dislike) {
    if (!err) {
      let isdislike;
      if (dislike) {
        isdislike = dislike.isdislike;
      }
      else {
        isdislike = false;
      }
      DislikeModel.where({ course_id: course_id, isdislike: true }).count(function (err, cnt) {
        res.send({
          code: 0, data: {
            isdislike: isdislike,
            dislike_count: cnt
          }
        });
      })
    }
  });
});

// 点赞课程
router.get("/course/clicklike", verifyToken, function (req, res, next) {
  let openid = req.payload.openid;
  let course_id = req.query.course_id;
  LikeModel.findOne({ openid: openid, course_id: course_id }, function (err, like) {
    if (!like) {
      new LikeModel({ openid: openid, course_id: course_id, islike: true }).save(function (err, doc) {
        res.send({ code: 0, data: doc });
      });
    }
    else {
      LikeModel.updateOne({ openid: openid, course_id: course_id }, { islike: true }, function (err, doc) {
        res.send({ code: 0, data: doc });
        console.log(doc);
      });
    }
  })
});
// 取消点赞课程
router.get("/course/cancellike", verifyToken, function (req, res, next) {
  let openid = req.payload.openid;
  let course_id = req.query.course_id;
  LikeModel.findOne({ openid: openid, course_id: course_id }, function (err, like) {
    LikeModel.updateOne({ openid: openid, course_id: course_id }, { islike: false }, function (err, doc) {
      res.send({ code: 0, data: doc });
      console.log(doc);
    });
  })
});

// 不喜欢课程
router.get("/course/clickdislike", verifyToken, function (req, res, next) {
  let openid = req.payload.openid;
  let course_id = req.query.course_id;
  DislikeModel.findOne({ openid: openid, course_id: course_id }, function (err, dislike) {
    if (!dislike) {
      new DislikeModel({ openid: openid, course_id: course_id, isdislike: true }).save(function (err, doc) {
        res.send({ code: 0, data: doc });
        console.log(doc);
      });
    }
    else {
      DislikeModel.updateOne({ _id: dislike._id }, { isdislike: true }, function (err, doc) {
        console.log(doc);
        res.send({ code: 0, data: doc });
      });
    }
  })
});
// 取消不喜欢课程
router.get("/course/canceldislike", verifyToken, function (req, res, next) {
  let openid = req.payload.openid;
  let course_id = req.query.course_id;
  DislikeModel.findOne({ openid: openid, course_id: course_id }, function (err, dislike) {
    DislikeModel.updateOne({ _id: dislike._id }, { isdislike: false }, function (err, doc) {
      res.send({ code: 0, data: doc });
      console.log(doc);
    });
  })
});

// 获取老师列表
router.get("/teacher", verifyToken, function (req, res, next) {
  TeacherModel.find({}, function (err, teachers) {
    res.send({ code: 0, data: teachers });
  })
});

// 按老师查询课程列表
router.get("/teacher/course", verifyToken, function (req, res, next) {
  const { teacher_name } = req.query;
  CourseModel.find({ teacher_name: teacher_name }, function (err, courses) {
    if (err) {
      res.send({ code: 1, msg: "Not Found" });
    }
    else {
      res.send({ code: 0, data: courses });
    }
  });
});

// 给某一门课评分
router.post("/score", verifyToken, function (req, res, next) {
  let { teacher_name, course_name, score } = req.body;
  score = Number(score);
  let flag = "";
  if (score < 60) {
    flag = "0";
  }
  else if (score < 70) {
    flag = "1";
  }
  else if (score < 80) {
    flag = "2";
  }
  else if (score < 90) {
    flag = "3";
  }
  else {
    flag = "4";
  }

  CourseModel.findOne({ teacher_name, course_name }, function (err, course) {
    let { total_score, people_count, average, _id, scores, percentage } = course;
    total_score += score;
    people_count += 1;
    average = (total_score / people_count).toFixed(2);
    scores[flag] += 1;
    indexs = ["0", "1", "2", "3", "4"];
    for (let index in indexs) {
      percentage[index] = (scores[index] / people_count * 100).toFixed(2);
    }
    CourseModel.updateOne(
      { _id },
      { total_score: total_score, people_count: people_count, average: average, scores: scores, percentage: percentage },
      function (err, doc) {
        if (err) {
          res.send({ code: 1, msg: err })
        }
        else {
          res.send({ code: 0, data: doc });
        }
      }
    );
  });
});

// 后台管理添加课程
router.post("/backstage/addcourse", verifyToken, function (req, res, next) {
  const { course_name, teacher_name } = req.body;
  CourseModel.findOne({ course_name, teacher_name }, function (err, course) {
    if (course) {
      res.send({ code: 1, msg: "Course Existed!" });
    }
    else {
      let teacher_id;
      TeacherModel.findOne({ teacher_name: teacher_name }, function (err, teacher) {
        teacher_id = teacher._id;
        console.log("teacherid:", teacher_id);
        new CourseModel({ course_name: course_name, teacher_id: teacher_id, teacher_name: teacher_name }).save(function (err, course) {
          console.log(course);
          res.send({ code: 0, data: course });
        });
      });
    }
  })
});

// 后台管理添加老师
router.post("/backstage/addteacher", verifyToken, function (req, res, next) {
  const { teacher_name, gender } = req.body;
  TeacherModel.findOne({ teacher_name, gender }, function (err, teacher) {
    if (teacher) {
      res.send({ code: 1, msg: "Teacher Existed!" });
    }
    else {
      new TeacherModel({ teacher_name: teacher_name, gender: gender }).save(function (err, teacher) {
        res.send({ code: 0, data: teacher });
      });
    }
  });
});

module.exports = router;
