require("dotenv").config();



const app = require("./src/app");
const connectToDB = require("./src/config/db");

connectToDB();







app.listen(3000, ()=>{
  console.log("Server is running on port 3000");
})





// mauryanidhi1610_db_user
// QlXiAaK2odG8ZKLY

//