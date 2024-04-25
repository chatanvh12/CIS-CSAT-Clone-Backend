import transporter from "../config/Mail.js";
export const sendEmail = async (receivers_email,message,subject) => {
          
    const info = await transporter.sendMail({
        from: "vhanmanechetan17@gmail.com", // sender address
        to: `${receivers_email}`, // list of receivers
        subject: `${subject}`, // Subject line
         html:(message)?(message):(" "),
        //  html:'<a href="http://localhost:8081/setpassword"> Click me</a>'
    })
    if(info.response.split(" ")[2]){
        return true;
    }
    return false;
}