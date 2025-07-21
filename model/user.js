const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  age: { type: Number, required: true, min: 1 },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  image: { type: String, default: "" },
  address: {
    area: { type: String, required: true },
    state: { type: String, required: true },
    pin: { type: String, required: true },
  },
  job: { type: String, required: true },
  educationQualification: { type: String, required: true },
  zodiacSign: {
    type: String,
    enum: [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ],
  },
  religion: { type: String, required: true },
  hobbies: {
    type: [{ type: String, maxlength: 50 }],
    validate: {
      validator: function (val) {
        return val.length === 5; // Must have exactly 5 hobbies
      },
      message: "You must provide exactly 5 hobbies",
    },
  },
  about: { type: String, maxlength: 500 },
  family: { type: String, maxlength: 500 },

  // New Interests Field (Array of Objects)
  // interests: [{
  //   ageRange: {
  //     min: { type: Number, required: true, min: 1 },
  //     max: { type: Number, required: true, min: 1 }
  //   },
  //   religion: { type: String, required: true }
  // }],

  interests: {
    type: [{ type: String, maxlength: 50 }],
    validate: {
      validator: function (val) {
        return val.length === 5; // Must have exactly 5 hobbies
      },
      message: "You must provide exactly 5 hobbies",
    },
  },

}, { timestamps: true });

// Hash password before saving user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
