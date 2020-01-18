const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/zuel-score";
mongoose.connect(url);
const conn = mongoose.connection;
conn.on("connected", () => {
  console.log("yes")
});

const courseSchema = mongoose.Schema({
  "course_name": { type: String, required: true },
  "teacher_id": { type: String, required: true },
  "teacher_name": { type: String, required: true },
  "average": { type: Number, required: false },
  "scores": {
    "0": { type: Number, required: false, default: 0 },
    "1": { type: Number, required: false, default: 0 },
    "2": { type: Number, required: false, default: 0 },
    "3": { type: Number, required: false, default: 0 },
    "4": { type: Number, required: false, default: 0 },
  },
  "percentage": {
    "0": { type: Number, required: false, default: 0 },
    "1": { type: Number, required: false, default: 0 },
    "2": { type: Number, required: false, default: 0 },
    "3": { type: Number, required: false, default: 0 },
    "4": { type: Number, required: false, default: 0 },
  },
  "people_count": { type: Number, required: false, default: 0 },
  "total_score": { type: Number, required: false, default: 0 }
});

const teacherSchema = mongoose.Schema({
  "teacher_name": { type: String, required: true },
  "gender": { type: Number, required: true }
});

const userSchema = mongoose.Schema({
  "openid": { type: String, required: true },
  "session_key": { type: String, required: true },
  "isverified": { type: Boolean, required: true, default: false }
})

const likeSchema = mongoose.Schema({
  "openid": { type: String, required: true },
  "course_id": { type: String, required: true },
  "islike": { type: Boolean, required: true }
})

const dislikeSchema = mongoose.Schema({
  "openid": { type: String, required: true },
  "course_id": { type: String, required: true },
  "isdislike": { type: Boolean, required: true }
})

const scoreSchema = mongoose.Schema({
  "openid": { type: String, required: true },
  "course_id": { type: String, required: true },
  "score": {
    "first": { type: String, required: true },
    "second": { type: String, required: true },
  }
})

const CourseModel = mongoose.model("course", courseSchema);
const TeacherModel = mongoose.model("teacher", teacherSchema);
const UserModel = mongoose.model("user", userSchema);
const LikeModel = mongoose.model("like", likeSchema);
const DislikeModel = mongoose.model("dislike", dislikeSchema);
const ScoreModel = mongoose.model("score", scoreSchema);

module.exports = {
  CourseModel: CourseModel,
  TeacherModel: TeacherModel,
  UserModel: UserModel,
  LikeModel: LikeModel,
  DislikeModel: DislikeModel,
  ScoreModel: ScoreModel
};