// function generateVerificationCode() {
//     const min = 100000; // Minimum 6-digit number
//     const max = 999999; // Maximum 6-digit number
//     return Math.floor(Math.random() * (max - min + 1)) + min;
//   }

import otpGenerator from "otp-generator";

export const randomCode = () => {

  // Example usage
  // const code = generateVerificationCode();
  // return code
  const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

  return otp
}
