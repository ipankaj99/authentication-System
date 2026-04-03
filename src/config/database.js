import mongoose from 'mongoose';
import config from './config.js'
async function connectToDb()
{
    try
    {
          await mongoose.connect(`${config.MONGO_URI}/auth-System`);
    console.log("connected Successfully");

    }
    catch(err)
    {
        console.log("error while connecting to database");
    }
  

}
export default connectToDb;