var express = require('express');
var router = express.Router();

const { TeacherModel, CourseModel } = require("../db/models");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

//获取课程列表
router.get("/course", function (req, res, next) {
  CourseModel.find({}, function (err, courses) {
    res.send({ code: 0, data: courses });
  })
});

// 获取课程详情
router.get("/course/detail", function (req, res, next) {
  const { course_name, teacher_name } = req.query;
  CourseModel.findOne({ course_name: course_name, teacher_name: teacher_name }, function (err, course) {
    res.send({ code: 0, data: course });
  })
})

// 获取老师列表
router.get("/teacher", function (req, res, next) {
  TeacherModel.find({}, function (err, teachers) {
    res.send({ code: 0, data: teachers });
  })
});

// 按老师查询课程列表
router.get("/teacher/course", function (req, res, next) {
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
router.post("/score", function (req, res, next) {
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
router.post("/backstage/addcourse", function (req, res, next) {
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
router.post("/backstage/addteacher", function (req, res, next) {
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
