var express = require('express');
var router = express.Router();

const { TeacherModel, CourseModel } = require("../db/models");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
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
})

//获取课程列表
router.get("/course", function (req, res, next) {
  CourseModel.find({}, function (err, courses) {
    res.send({ code: 0, data: courses });
  })
});

// 获取老师列表
router.get("/teacher", function (req, res, next) {
  TeacherModel.find({}, function (err, teachers) {
    res.send({ code: 0, data: teachers });
  })
})

module.exports = router;
