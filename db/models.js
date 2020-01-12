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
  "score0": { type: Number, required: false },
  "score1": { type: Number, required: false },
  "score2": { type: Number, required: false },
  "score3": { type: Number, required: false },
  "score4": { type: Number, required: false },
  "people_count": { type: Number, required: false }
});
const CourseModel = mongoose.model("course", courseSchema);

const teacherSchema = mongoose.Schema({
  "teacher_name": { type: String, required: true },
  "gender": { type: Number, required: true }
});
const TeacherModel = mongoose.model("teacher", teacherSchema);

module.exports = {
  CourseModel: CourseModel,
  TeacherModel: TeacherModel
};