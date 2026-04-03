import mongoose from 'mongoose';
const sessionSchema= new mongoose.Schema(
    {
        userId:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"users"
        },
        refreshTokenHash:{
            type:String
        },
        ip:{
            type:String
        },
        userAgent:{
            type:String,

        },
        revoked:{
            type:Boolean,
            default:false
        }

    },
    {
        timestamps:true
    }
)

const sessionModel= mongoose.model("sessions", sessionSchema);
export default sessionModel;