

const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");






//! user Schema
const userSchema = new mongoose.Schema({
  email:{
    type:String,
    required: [true, "Email is required"],
    trim:true,
    lowercase:true,
    match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
    unique: [true, "Email already exists"]
  },
  name:{
    type:String,
    required: [true, "Name is required"],
    trim:true,
    lowercase:true,



    

  },

  password:{
    type:String,
    required:[true, "Password is required"],
    trim:true,
    minlength:[8, "Password must be at least 8   characters long"],
    select:false
  },
    systemUser:{
      type:Boolean,
      default:false,
      immutable:true,
      select:false,
    }






},{
  timestamps:true
})


userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};



const userModel = mongoose.model("user",userSchema)

module.exports = userModel