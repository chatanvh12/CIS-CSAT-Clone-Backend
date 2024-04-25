import VerificationCode from "../models/varificationCode.js";

export const isVerifiedCode=async(email,code)=>{
    try {
        if(!email || !code ){
            return "invalid_credentials";
        }
        console.log("email",email);
        const codeData=await VerificationCode.findOne({
           where:{
            email
           }
        });
        // const codeData=await VerificationCode.findAll({});
        console.log("code",codeData);

        if (codeData && codeData.dataValues.expiresAt > new Date() && code==codeData.dataValues.otp) {
            // OTP is valid and not expired
            // return res.status(200).json({ message: 'OTP verified successfully' });
            await VerificationCode.destroy({
                where: {
                    email
                }
            })
            return true
          } else {
            // OTP is invalid or expired
            // return res.status(400).json({ message: 'Invalid OTP or OTP expired' });
            await VerificationCode.destroy({
                where: {
                    email
                }
            })
            return false
          }
    } catch (error) {
        console.error(error);
    return res.status(500).json({ message: 'Failed to verify OTP' });
    }

}