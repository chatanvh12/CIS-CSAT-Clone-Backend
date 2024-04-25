
import jwt from "jsonwebtoken";
export const isExpired = async (req, res) => {
    try {
        // console.log("one");
        const token = req;
        // console.log("token",token);
        // console.log("two");
        const decodeData =  jwt.verify(token, process.env.JWT_SECRET);
        // console.log("three");
        const currentTimestamp = Math.floor(Date.now() / 1000);
        
        // console.log("five");
        if (decodeData.exp < currentTimestamp) {
            //   return t;
            return true;
        }
        return false;
    } catch (error) {
        // console.log(error);
        console.log("expired");
        return true

    }
}