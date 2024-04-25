import { Op, where } from "sequelize";
import { isExpired } from "../middlewares/jwt_Expiry.js";
import organizations from "../models/organizations.js";
// import User from "../models/user.js";
import Jwt from "jsonwebtoken";
import transporter from "../config/Mail.js";
import dotenv from 'dotenv';
import { randomCode } from "../utils/verification_code.js";
import { isVerifiedCode } from "../utils/isVerifiedCode.js";
import { sendEmail } from "../utils/sendEmail.js";
import VerificationCode from "../models/varificationCode.js";
import User, { UserOrganization, UserRole } from "../models/user.js";
import sequelize from "../config/DB.js";
import Organization from "../models/organizations.js";
import roles, { RoleAttributes } from "../models/role.js";
import Attribute from "../models/Attributes.js";
import Book2 from "../models/othercontrols.js";
dotenv.config()
export const registerController = async (req, res) => {
    console.log(req.body);
    const { id, firstName, lastName, email, roleId, conformEmail, passward, conformPassword, orgName, industryType, group, website, controlVersion, terms } = req.body;
    //Validation
    if (!firstName || !lastName || !email || !roleId || !conformEmail || !passward || !conformPassword || !orgName || !industryType || !group || !website || !controlVersion || !terms) {
        return res.status(500).send({
            success: false,
            message: " Please Provide All Fields",
        })
    } else {
        const transaction = await sequelize.transaction();
        try {
            //checking Wether user exist or not
            const existingUser = await User.findOne({
                where: {
                    email
                }
            })
            // console.log("calles", existingUser);
            if (existingUser) {
                return res.status(409).send({
                    success: false,
                    message: "Email Already Taken"
                })
            }
            // checking wether organization is exist already or not
            const existingOrg = await organizations.findOne({
                where: {
                    orgName
                }
            })
            // validation for organization
            if (existingOrg) {
                return res.status(409).send({
                    success: false,
                    message: "Please Contact Your Admin..."
                })
            }
            const role = await roles.findByPk(roleId);
            console.log(role);
            const createUser = await User.create({
                // id,
                firstName,
                lastName,
                email,
                password: passward,
                // rolesId:roleId
            }, { transaction });
            if (!createUser) {
                throw new Error("Error creating user");
            }
            if (createUser && role) {
                // Associate user and organization (assuming UserOrganization model exists)
                await UserRole.create({
                    UserId: await createUser.id,
                    roleId: await roleId
                }, { transaction }); // Include transaction for consistency
                // console.log("Created UserOrganization:", createUser.id, createorg.id);
            } else {
                throw new Error("Failed to create user or organization. Unable to create association.");
            }
            // console.log(createUser);
            const createorg = await organizations.create({
                // id,
                orgName,
                website,
                industryType,
                group,
                controlVersion,
                terms,
                userId: createUser.id,
            }, {
                transaction
            });
            if (!createorg) {
                throw new Error("Error creating organization");
            };
            // Query the associations
            // const userOrganizations = await User.getOrganizations();
            // const userId = createUser.id;
            // const organizationId = createorg.id;
            // // console.log(userId, organizationId);
            // await UserOrganization.create({
            //     userId: userId,
            //     organizationId: organizationId
            // })
            if (createUser && createorg) {
                // Associate user and organization (assuming UserOrganization model exists)
                await UserOrganization.create({
                    UserId: await createUser.id,
                    OrganizationId: await createorg.id
                }, { transaction }); // Include transaction for consistency
                console.log("Created UserOrganization:", createUser.id, createorg.id);
            } else {
                throw new Error("Failed to create user or organization. Unable to create association.");
            }
            await transaction.commit()

            if (!createUser || !createorg) {
                return res.status(500).send({
                    message: "server Error"
                })
            }
            res.status(201).send({
                success: true,
                message: "Registeren Successfully",
                // profile
            });

        } catch (error) {
            console.log(error);
            res.status(500).send({
                success: false,
                message: "Error In Register API",
                error,
            });
        }
    }
}
export const getUsers = async (req, res) => {
    try {
        const data = await User.findAll({
            include: {
                model: Organization,
                through: UserOrganization, // Specify the junction table
                attributes: ['id', 'orgName', 'website'] // Select specific organization fields
            },
            include: {
                model: roles,
                through: UserRole
            }
        });
        console.log(data);
        res.send({
            data
        })

    } catch (error) {
        console.log(error);
    }
}

export const loginController = async (req, res) => {
    // const send = await sendEmail();

    // console.log(req);
    try {
        const { email, password } = req.body;
        //validation
        if (!email || !password) {
            return res.status(500).send({
                success: false,
                message: "Please Add Email Or Password",
            });
        }
        // cheak existance of user
        const userData = await User.findOne({
            where: {
                email
            }
        })
        if (!userData) {

            return res.status(404).send({
                success: false,
                message: "Invalid Email or Password"
            })
        }
        //comparing password
        const isMatch = true //await bcrypt.compare(password, user.password);
        //Validation for password maching
        if (!isMatch) {
            return res.status(409).send({
                success: false,
                message: "Invalid Cradential"
            })
        } else {
            //generating random Code
            const randomcode = randomCode();

            // Calculate expiration time (1 minute from now)
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 1); // 1 minute from now

            //sending Email to user
            const message = `
            <html>
            <head>
                <style>
                    body {
                     font-family: Arial, sans-serif;
                     height:100%;
                    }
                    .otp-message {
                     border: 2px solid #00aaff;
                     padding: 20px;
                     margin: 20px;
                     height:100%;
                     border-radius: 5px;
                    }
                </style>
            </head>
            <body>
            <div class="otp-message">
                 <h2>Your OTP is: <span style="color: green;">${randomcode}</span></h2>
                  <p>Apprely takes your account security very seriously. Apprely will never email you and ask you to disclose or verify your Apprely password.
                    If you receive a suspicious email with a link to update your account information, do not click on the link—instead,
                    report the email to Apprely for investigation.</p>

                  <p>Thank you,</p>
    
                  <p>Apprely Support</p>
            </div>
            </body>
            </html>`;
            const subject = "please verify it's you - Apprely";
            const send = await sendEmail("chetan.vhanmane.17.@gmail.com", message, subject);
            // console.log(userData.id);
            if (!send) {
                return res.status(500).send({
                    success: fasle,
                    message: "server error while sending email at usercontroller 182"
                })
            }
            //checking wether the code exist or not
            const codeData = await VerificationCode.findOne({
                where: {
                    email
                }
            })
            let sent;

            //if exist then validate
            if (codeData) {
                //updating code 
                sent = await VerificationCode.update({
                    otp: randomcode,
                    expiresAt
                }, { where: { email } });
                // console.log(s[0]);
            } else {
                //if not exist then entering code 
                sent = await VerificationCode.create({
                    email, expiresAt,
                    otp: randomcode
                }).catch((error) => {
                    console.log(error);
                })
            }
            //sending success message to user 
            if (sent[0]) {
                return res.status(200).send({
                    success: true,
                    message: "Please cheak Your Registered Email For OTP "
                })
            }
        }
    }
    catch (error) {
        //error handling 
        console.log(error);
    }
}
//after sending OTP following function is for verifying code and sending jwt token to user
export const verifyCodeAndLogin = async (req, res) => {
    const { email, code } = req.body;
    try {
        const userData = await User.findOne({
            where: {
                email
            }
        });
        // console.log(userData);
        //verification of code
        const isverified = await isVerifiedCode(email, code);
        console.log("verified", isverified);
        //validation
        if (!isverified) {
            await VerificationCode.destroy({
                where: {
                    email
                }
            })
            return res.status(401).send({
                success: false,
                message: "Login otp expired"
            })
        }


        //Generating JWT TOken
        const token = Jwt.sign({ id: userData.id }, process.env.JWT_SECRET, {
            expiresIn: '60m'// 1 hours in seconds
        });

        if (!token) {
            res.status(500).send({
                success: false,
                message: "some thing went wrong in userController at line 146"
            })
        }

        // getting token array 
        let currentTokensArray = userData.tokens;
        let newTokens = [];

        // Ensure currentTokensArray is an array
        if (!Array.isArray(currentTokensArray)) {
            currentTokensArray = [];
        }
        for (const token of currentTokensArray) {
            const isexpired = await isExpired(token);
            if (!isexpired) {
                newTokens.push(token);
            }
        }
        console.log(userData.tokens);
        // Add the new token to the current tokens array
        newTokens.push(token);
        console.log(newTokens);


        await User.update({ tokens: newTokens }, { where: { id: userData.id } })
            .then(() => {
                console.log('Tokens updated successfully');
            })
            .catch((error) => {
                console.error('Error updating tokens:', error);
            });
        res.send({
            success: true,
            message: "Login Successfully",
            token: token
        });



    } catch (error) {
        console.log(error);
    }
}
export const logOutController = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res
            .status(401)
            .json({ success: false, message: 'Authorization failed!' });
    }

    try {
        // Find the user by the token
        const user = await User.findOne({ where: { tokens: { [Op.contains]: [token] } } });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: 'User not found!' });
        }

        // Filter out expired tokens
        const newTokens = user.tokens.filter(t => !isExpired(t));

        // Update the user document with the new tokens array
        await User.update({ tokens: newTokens }, { where: { id: user.id } });

        res.json({ success: true, message: 'Sign out successful!' });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const changeUserPasswordController = async (req, res) => {
    //getting data
    const { oldpassward, newpassward, passward_confirmation } = req.body;
    const { passward, id } = req.user

    //validation and further process
    if (oldpassward && passward_confirmation) {
        //validation
        if (newpassward !== passward_confirmation) {
            res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
        } else if (passward !== oldpassward) {
            res.send({ "status": "failed", "message": "old password is incorrect" })
        } else if (newpassward === passward) {
            res.send({
                success: false,
                message: "password should not match with previous one "
            })
        } else {
            const salt = newpassward;//await bcrypt.genSalt(10)
            const newHashPassword = newpassward;//await bcrypt.hash(password, salt)
            await User.update({ passward: newHashPassword }, { where: { id } });
            res.send({ "status": "success", "message": "Password changed succesfully" })
        }
    } else {
        res.send({ "status": "failed", "message": "All Fields are Required" })
    }
}

export const loggedUser = async (req, res) => {
    res.send({ "user": req.user })
}

//password reset
export const sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    try {
        // if (!email) {
        //     res.status(400).send({
        //         success: false,
        //         message: "email is required"
        //     })
        // } else {
        //     const userData = await User.findOne({
        //         where: {
        //             email
        //         }
        //     });
        // console.log("one");
        // if (!userData) {
        //     res.status(409).send({
        //         success: false,
        //         message: "Email doesn't found"
        //     })
        //     // console.log("two");
        // } else {
        // console.log("three");
        // const secret = userData.id + process.env.JWT_SECRET;
        // // console.log(secret);
        const token = "dsfsadf";// Jwt.sign({ id: userData.id }, secret, {
        //     expiresIn: '15m'
        // });
        // console.log(token);
        const userData = 4;
        let link = `http://localhost:3000/api/user/reset/${userData}/${token}`;
        const message = `
                <html>
                <head>
                    <style>
                        body {
                         font-family: Arial, sans-serif;
                         height:100%;
                        }
                        .otp-message {
                         border: 2px solid #00aaff;
                         padding: 20px;
                         margin: 20px;
                         height:100%;
                         border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                <div class="otp-message">
                     <h2>Link for setting new password: <a href="${link}">Reset Password</a></h2>
                      <p>Apprely takes your account security very seriously. Apprely will never email you and ask you to disclose or verify your Apprely password.
                        If you receive a suspicious email with a link to update your account information, do not click on the link—instead,
                        report the email to Apprely for investigation.</p>
                      <p>Thank you,</p>
        
                      <p>Apprely Support</p>
                </div>
                </body>
                </html>
                `;
        const subject = "No-reply Email For Setting New Password"
        // console.log(transporter);
        // console.log(process.env.PASS + " " + process.env.MAIL_ID);
        await sendEmail("chetan.vhanmane.17@gmail.com", message, subject);
        // const info = await transporter.sendMail({
        //     from: "vhanmanechetan17@gmail.com", // sender address
        //     to: "chetan.vhanmane.17@gmail.com", // list of receivers
        //     subject: "Hello ✔", // Subject line
        //     text: "Hello world?", // plain text body
        //     html: `<div><h1>Hello world? chetan</h1> <a href=${link}>Click me</a></div>`, // html body
        // });

        res.send({
            success: true,
            message: "Link for reset Password is sent, please cheak your email"
        })
        // }
        // }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "error at usercontroller at 260",
            error
        })

        // }
    }
}

export const userPasswordReset = async (req, res) => {
    const { passward, passward_confirmation } = req.body;
    const { id, token } = req.params;
    const user = await User.findByPk(id);
    const new_Secret = user.id + process.env.JWT_SECRET;
    try {
        await Jwt.verify(token, new_Secret);
        if (passward && passward_confirmation) {
            if (passward !== passward_confirmation) {
                res.status(400).send({
                    success: false,
                    message: "New Password and Confirm New Password doesn't match"
                })
            } else {
                const salt = await bcrypt.getSalt(10);
                const newHashPassword = passward;//await bcrypt.hash(passward,salt);
                await User.update({ passward: newHashPassword }, { where: { id } });
                res.send({ "status": "success", "message": "Password changed succesfully" })
            }
        }
    } catch (error) {
        res.send({
            success: false,
            message: "Invalid Token"
        })
    }
}
//**************** User Role**************************/
export const addRole = async (req, res) => {
    let { roleName } = req.body;
    roleName = roleName.toLowerCase();
    try {
        // Check if the role already exists
        const existingRole = await roles.findOne({
            where: {
                role: roleName
            }
        });

        if (existingRole) {
            return res.status(409).json({ message: 'Role already exists' });
        }

        // Create the role if it doesn't exist
        const result = await roles.create({
            role: roleName
        });

        res.status(201).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
export const getRole = async (req, res) => {
    try {
        const result = await roles.findAll({
            include: [{
                model: User,
                through: UserRole,
                attributes: ['id']
            },
            {
                model: Attribute,
                through: {
                    model: RoleAttributes,
                    attributes: []
                },
                attributes: ['id', 'attribute_name']
            }]
        });
        console.log(result);
        const rolesWithEmployeeCount = result?.map((role) => ({
            id: role.id,
            role: role.role,
            employeeCount: role.Users.length, // Count the number of employees
            Attributes: role.Attributes
        }));
        res.status(200).json({ data: rolesWithEmployeeCount });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });

    }
}
export const deleteRole = async (req, res) => {
    const { id } = req.body;
    try {
        const result = await roles.destroy({
            where: {
                id
            }
        });
        if (result === 0) {
            // No rows were deleted
            return res.status(404).send('Role not found');
        }
        console.log(result);
        res.send("Successfully deleted"); // No content
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
}
export const updateRole = async (req, res) => {
    const { id, name } = req.body;
    try {
        const result = await roles.update(
            { role: name }, // New role value to set
            { where: { id } } // Condition to find the row to update
        );
        // Check the result to see if any rows were affected
        console.log(req.body);
        if (result[0] === 0) {
            // No rows were updated
            return res.status(404).send("Role not found");
        }
        res.status(200).send("Role updated successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to update role");
    }
}
export const addRoleAttibutes = async (req, res) => {
    const { roleId, attributeIds } = req.body;
    try {
        // Find the role
        const role = await roles.findByPk(roleId);
        if (!role) {
            console.log('Role not found');
            return;
        }

        // Find the attributes
        const attributes = await Attribute.findAll({ where: { id: attributeIds } });
        if (attributes.length !== attributeIds.length) {
            console.log('One or more attributes not found');
            return;
        }
        //   console.log(attributes);
        // Create an array of objects for bulk insertion
        const roleAttributes = attributes.map(attribute => ({
            roleId: roleId,
            AttributeId: attribute.dataValues.id
        }));
        console.log(roleAttributes);
        // Insert the records into the join table
        await RoleAttributes.bulkCreate(roleAttributes);

        console.log('Attributes added to role');
    } catch (err) {
        console.error('Error adding attributes to role:', err);
    }
}
export const getRoleAttributes = async (req, res) => {
    const { roleId } = req.body;
    try {
        // Find all role controls for the given role ID
        const roleControls = await roles.findAll({
            where: { id: roleId },
            include: [
                {
                    model: Attribute,
                    through: {
                        model: RoleAttributes,
                        attributes: []
                    },
                    attributes: ['id', 'attribute_name']
                }
            ]
        });
        res.status(200).send(roleControls);
        console.log('Role Controls:', roleControls);
    } catch (err) {
        console.error('Error getting role controls:', err);
    }

}
/********************** User Role Ends ***************/
/* *************************** Attributes *********************** */

export const getAttributes = async (req, res) => {
    try {
        const result = await Attribute.findAll();
        res.status(200).send(result);
    } catch (error) {
        console.log(error);
    }
}
export const getequivalent = async (req, res) => {
    const data = [
        { constrol_framework: 'cis', control: '1.01', score: 1 },
        { constrol_framework: 'cis', control: '1.02', score: 1 },
        { constrol_framework: 'cis', control: '1.03', score: 1 },
        { constrol_framework: 'cis', control: '1.04', score: 1 },
        { constrol_framework: 'cis', control: '1.05', score: 1 },
        { constrol_framework: 'cis', control: '2.01', score: 1 },
        { constrol_framework: 'cis', control: '2.02', score: 1 },
        { constrol_framework: 'cis', control: '2.03', score: 1 },
        { constrol_framework: 'cis', control: '2.04', score: 1 },
        { constrol_framework: 'cis', control: '2.05', score: 1 },
        { constrol_framework: 'cis', control: '2.06', score: 1 },
        { constrol_framework: 'cis', control: '2.07', score: 1 },
        { constrol_framework: 'cis', control: '3.01', score: 1 },
        { constrol_framework: 'cis', control: '3.02', score: 1 },
        { constrol_framework: 'cis', control: '3.03', score: 1 },
        { constrol_framework: 'cis', control: '3.04', score: 1 },
        { constrol_framework: 'cis', control: '3.05', score: 1 },
        { constrol_framework: 'cis', control: '3.06', score: 1 },
        { constrol_framework: 'cis', control: '3.07', score: 1 },
        { constrol_framework: 'cis', control: '3.08', score: 1 },
        { constrol_framework: 'cis', control: '3.09', score: 1 },
        { constrol_framework: 'cis', control: '3.10', score: 1 },
        { constrol_framework: 'cis', control: '3.11', score: 1 },
        { constrol_framework: 'cis', control: '3.12', score: 1 },
        { constrol_framework: 'cis', control: '3.13', score: 1 },
        { constrol_framework: 'cis', control: '3.14', score: 1 },
        { constrol_framework: 'cis', control: '4.01', score: 1 },
        { constrol_framework: 'cis', control: '4.02', score: 1 },
        { constrol_framework: 'cis', control: '4.03', score: 1 },
        { constrol_framework: 'cis', control: '4.04', score: 1 },
        { constrol_framework: 'cis', control: '4.05', score: 1 },
        { constrol_framework: 'cis', control: '4.06', score: 1 },
        { constrol_framework: 'cis', control: '4.07', score: 1 },
        { constrol_framework: 'cis', control: '4.08', score: 1 },
        { constrol_framework: 'cis', control: '4.09', score: 1 },
        { constrol_framework: 'cis', control: '4.10', score: 1 },
        { constrol_framework: 'cis', control: '4.11', score: 1 },
        { constrol_framework: 'cis', control: '4.12', score: 1 },
        { constrol_framework: 'cis', control: '5.01', score: 1 },
        { constrol_framework: 'cis', control: '5.02', score: 1 },
        { constrol_framework: 'cis', control: '5.03', score: 1 },
        { constrol_framework: 'cis', control: '5.04', score: 1 },
        { constrol_framework: 'cis', control: '5.05', score: 1 },
        { constrol_framework: 'cis', control: '5.06', score: 1 },
        { constrol_framework: 'cis', control: '6.01', score: 1 },
        { constrol_framework: 'cis', control: '6.02', score: 1 },
        { constrol_framework: 'cis', control: '6.03', score: 1 },
        { constrol_framework: 'cis', control: '6.04', score: 1 },
        { constrol_framework: 'cis', control: '6.05', score: 1 },
        { constrol_framework: 'cis', control: '6.06', score: 1 },
        { constrol_framework: 'cis', control: '6.07', score: 1 },
        { constrol_framework: 'cis', control: '6.08', score: 1 },
        { constrol_framework: 'cis', control: '7.01', score: 1 },
        { constrol_framework: 'cis', control: '7.02', score: 1 },
        { constrol_framework: 'cis', control: '7.03', score: 1 },
        { constrol_framework: 'cis', control: '7.04', score: 1 },
        { constrol_framework: 'cis', control: '7.05', score: 1 },
        { constrol_framework: 'cis', control: '7.06', score: 1 },
        { constrol_framework: 'cis', control: '7.07', score: 1 },
        { constrol_framework: 'cis', control: '8.01', score: 1 },
        { constrol_framework: 'cis', control: '8.02', score: 1 },
        { constrol_framework: 'cis', control: '8.03', score: 1 },
        { constrol_framework: 'cis', control: '8.04', score: 1 },
        { constrol_framework: 'cis', control: '8.05', score: 1 },
        { constrol_framework: 'cis', control: '8.06', score: 1 },
        { constrol_framework: 'cis', control: '8.07', score: 1 },
        { constrol_framework: 'cis', control: '8.08', score: 1 },
        { constrol_framework: 'cis', control: '8.09', score: 1 },
        { constrol_framework: 'cis', control: '8.10', score: 1 },
        { constrol_framework: 'cis', control: '8.11', score: 1 },
        { constrol_framework: 'cis', control: '8.12', score: 1 },
        { constrol_framework: 'cis', control: '9.01', score: 1 },
        { constrol_framework: 'cis', control: '9.02', score: 1 },
        { constrol_framework: 'cis', control: '9.03', score: 1 },
        { constrol_framework: 'cis', control: '9.04', score: 1 },
        { constrol_framework: 'cis', control: '9.05', score: 1 },
        { constrol_framework: 'cis', control: '9.06', score: 1 },
        { constrol_framework: 'cis', control: '9.07', score: 1 },
        { constrol_framework: 'cis', control: '10.01', score: 1 },
        { constrol_framework: 'cis', control: '10.02', score: 1 },
        { constrol_framework: 'cis', control: '10.03', score: 1 },
        { constrol_framework: 'cis', control: '10.04', score: 1 },
        { constrol_framework: 'cis', control: '10.05', score: 1 },
        { constrol_framework: 'cis', control: '10.06', score: 1 },
        { constrol_framework: 'cis', control: '10.07', score: 1 },
        { constrol_framework: 'cis', control: '11.01', score: 1 },
        { constrol_framework: 'cis', control: '11.02', score: 1 },
        { constrol_framework: 'cis', control: '11.03', score: 1 },
        { constrol_framework: 'cis', control: '11.04', score: 1 },
        { constrol_framework: 'cis', control: '11.05', score: 1 },
        { constrol_framework: 'cis', control: '12.01', score: 1 },
        { constrol_framework: 'cis', control: '12.02', score: 1 },
        { constrol_framework: 'cis', control: '12.03', score: 1 },
        { constrol_framework: 'cis', control: '12.04', score: 1 },
        { constrol_framework: 'cis', control: '12.05', score: 1 },
        { constrol_framework: 'cis', control: '12.06', score: 1 },
        { constrol_framework: 'cis', control: '12.07', score: 1 },
        { constrol_framework: 'cis', control: '12.08', score: 1 },
        { constrol_framework: 'cis', control: '13.01', score: 1 },
        { constrol_framework: 'cis', control: '13.02', score: 1 },
        { constrol_framework: 'cis', control: '13.03', score: 1 },
        { constrol_framework: 'cis', control: '13.04', score: 1 },
        { constrol_framework: 'cis', control: '13.05', score: 1 },
        { constrol_framework: 'cis', control: '13.06', score: 1 },
        { constrol_framework: 'cis', control: '13.07', score: 1 },
        { constrol_framework: 'cis', control: '13.08', score: 1 },
        { constrol_framework: 'cis', control: '13.09', score: 1 },
        { constrol_framework: 'cis', control: '13.10', score: 1 },
        { constrol_framework: 'cis', control: '13.11', score: 1 },
        { constrol_framework: 'cis', control: '14.01', score: 1 },
        { constrol_framework: 'cis', control: '14.02', score: 1 },
        { constrol_framework: 'cis', control: '14.03', score: 1 },
        { constrol_framework: 'cis', control: '14.04', score: 1 },
        { constrol_framework: 'cis', control: '14.05', score: 1 },
        { constrol_framework: 'cis', control: '14.06', score: 1 },
        { constrol_framework: 'cis', control: '14.07', score: 1 },
        { constrol_framework: 'cis', control: '14.08', score: 1 },
        { constrol_framework: 'cis', control: '14.09', score: 1 },
        { constrol_framework: 'cis', control: '15.01', score: 1 },
        { constrol_framework: 'cis', control: '15.02', score: 1 },
        { constrol_framework: 'cis', control: '15.03', score: 1 },
        { constrol_framework: 'cis', control: '15.04', score: 1 },
        { constrol_framework: 'cis', control: '15.05', score: 1 },
        { constrol_framework: 'cis', control: '15.06', score: 1 },
        { constrol_framework: 'cis', control: '15.07', score: 1 },
        { constrol_framework: 'cis', control: '16.01', score: 1 },
        { constrol_framework: 'cis', control: '16.02', score: 1 },
        { constrol_framework: 'cis', control: '16.03', score: 1 },
        { constrol_framework: 'cis', control: '16.04', score: 1 },
        { constrol_framework: 'cis', control: '16.05', score: 1 },
        { constrol_framework: 'cis', control: '16.06', score: 1 },
        { constrol_framework: 'cis', control: '16.07', score: 1 },
        { constrol_framework: 'cis', control: '16.08', score: 1 },
        { constrol_framework: 'cis', control: '16.09', score: 1 },
        { constrol_framework: 'cis', control: '16.10', score: 1 },
        { constrol_framework: 'cis', control: '16.11', score: 1 },
        { constrol_framework: 'cis', control: '16.12', score: 1 },
        { constrol_framework: 'cis', control: '16.13', score: 1 },
        { constrol_framework: 'cis', control: '16.14', score: 1 },
        { constrol_framework: 'cis', control: '17.01', score: 1 },
        { constrol_framework: 'cis', control: '17.02', score: 1 },
        { constrol_framework: 'cis', control: '17.03', score: 1 },
        { constrol_framework: 'cis', control: '17.04', score: 1 },
        { constrol_framework: 'cis', control: '17.05', score: 1 },
        { constrol_framework: 'cis', control: '17.06', score: 1 },
        { constrol_framework: 'cis', control: '17.07', score: 1 },
        { constrol_framework: 'cis', control: '17.08', score: 1 },
        { constrol_framework: 'cis', control: '17.09', score: 1 },
        { constrol_framework: 'cis', control: '18.01', score: 1 },
        { constrol_framework: 'cis', control: '18.02', score: 1 },
        { constrol_framework: 'cis', control: '18.03', score: 1 },
        { constrol_framework: 'cis', control: '18.04', score: 1 },
        { constrol_framework: 'cis', control: '18.05', score: 1 },

        { constrol_framework: 'iso', control: '1.01', score: 1 },
        { constrol_framework: 'iso', control: '1.02', score: 1 },
        { constrol_framework: 'iso', control: '1.03', score: 1 },
        { constrol_framework: 'iso', control: '1.04', score: 1 },
        { constrol_framework: 'iso', control: '1.05', score: 1 },
        { constrol_framework: 'iso', control: '2.01', score: 1 },
        { constrol_framework: 'iso', control: '2.02', score: 1 },
        { constrol_framework: 'iso', control: '2.03', score: 1 },
        { constrol_framework: 'iso', control: '2.04', score: 1 },
        { constrol_framework: 'iso', control: '2.05', score: 1 },
        { constrol_framework: 'iso', control: '2.06', score: 1 },
        { constrol_framework: 'iso', control: '2.07', score: 1 },
        { constrol_framework: 'iso', control: '3.01', score: 1 },
        { constrol_framework: 'iso', control: '3.02', score: 1 },
        { constrol_framework: 'iso', control: '3.03', score: 1 },
        { constrol_framework: 'iso', control: '3.04', score: 1 },
        { constrol_framework: 'iso', control: '3.05', score: 1 },
        { constrol_framework: 'iso', control: '3.06', score: 1 },
        { constrol_framework: 'iso', control: '3.07', score: 1 },
        { constrol_framework: 'iso', control: '3.08', score: 1 },
        { constrol_framework: 'iso', control: '3.09', score: 1 },
        { constrol_framework: 'iso', control: '3.10', score: 1 },
        { constrol_framework: 'iso', control: '3.11', score: 1 },
        { constrol_framework: 'iso', control: '3.12', score: 1 },
        { constrol_framework: 'iso', control: '3.13', score: 1 },
        { constrol_framework: 'iso', control: '3.14', score: 1 },
        { constrol_framework: 'iso', control: '4.01', score: 1 },
        { constrol_framework: 'iso', control: '4.02', score: 1 },
        { constrol_framework: 'iso', control: '4.03', score: 1 },
        { constrol_framework: 'iso', control: '4.04', score: 1 },
        { constrol_framework: 'iso', control: '4.05', score: 1 },
        { constrol_framework: 'iso', control: '4.06', score: 1 },
        { constrol_framework: 'iso', control: '4.07', score: 1 },
        { constrol_framework: 'iso', control: '4.08', score: 1 },
        { constrol_framework: 'iso', control: '4.09', score: 1 },
        { constrol_framework: 'iso', control: '4.10', score: 1 },
        { constrol_framework: 'iso', control: '4.11', score: 1 },
        { constrol_framework: 'iso', control: '4.12', score: 1 },
        { constrol_framework: 'iso', control: '5.01', score: 1 },
        { constrol_framework: 'iso', control: '5.02', score: 1 },
        { constrol_framework: 'iso', control: '5.03', score: 1 },
        { constrol_framework: 'iso', control: '5.04', score: 1 },
        { constrol_framework: 'iso', control: '5.05', score: 1 },
        { constrol_framework: 'iso', control: '5.06', score: 1 },
        { constrol_framework: 'iso', control: '6.01', score: 1 },
        { constrol_framework: 'iso', control: '6.02', score: 1 },
        { constrol_framework: 'iso', control: '6.03', score: 1 },
        { constrol_framework: 'iso', control: '6.04', score: 1 },
        { constrol_framework: 'iso', control: '6.05', score: 1 },
        { constrol_framework: 'iso', control: '6.06', score: 1 },
        { constrol_framework: 'iso', control: '6.07', score: 1 },
        { constrol_framework: 'iso', control: '6.08', score: 1 },
        { constrol_framework: 'iso', control: '7.01', score: 1 },
        { constrol_framework: 'iso', control: '7.02', score: 1 },
        { constrol_framework: 'iso', control: '7.03', score: 1 },
        { constrol_framework: 'iso', control: '7.04', score: 1 },
        { constrol_framework: 'iso', control: '7.05', score: 1 },
        { constrol_framework: 'iso', control: '7.06', score: 1 },
        { constrol_framework: 'iso', control: '7.07', score: 1 },
        { constrol_framework: 'iso', control: '8.01', score: 1 },
        { constrol_framework: 'iso', control: '8.02', score: 1 },
        { constrol_framework: 'iso', control: '8.03', score: 1 },
        { constrol_framework: 'iso', control: '8.04', score: 1 },
        { constrol_framework: 'iso', control: '8.05', score: 1 },
        { constrol_framework: 'iso', control: '8.06', score: 1 },
        { constrol_framework: 'iso', control: '8.07', score: 1 },
        { constrol_framework: 'iso', control: '8.08', score: 1 },
        { constrol_framework: 'iso', control: '8.09', score: 1 },
        { constrol_framework: 'iso', control: '8.10', score: 1 },
        { constrol_framework: 'iso', control: '8.11', score: 1 },
        { constrol_framework: 'iso', control: '8.12', score: 1 },
        { constrol_framework: 'iso', control: '9.01', score: 1 },
        { constrol_framework: 'iso', control: '9.02', score: 1 },
        { constrol_framework: 'iso', control: '9.03', score: 1 },
        { constrol_framework: 'iso', control: '9.04', score: 1 },
        { constrol_framework: 'iso', control: '9.05', score: 1 },
        { constrol_framework: 'iso', control: '9.06', score: 1 },
        { constrol_framework: 'iso', control: '9.07', score: 1 },
        { constrol_framework: 'iso', control: '10.01', score: 1 },
        { constrol_framework: 'iso', control: '10.02', score: 1 },
        { constrol_framework: 'iso', control: '10.03', score: 1 },
        { constrol_framework: 'iso', control: '10.04', score: 1 },
        { constrol_framework: 'iso', control: '10.05', score: 1 },
        { constrol_framework: 'iso', control: '10.06', score: 1 },
        { constrol_framework: 'iso', control: '10.07', score: 1 },
        { constrol_framework: 'iso', control: '11.01', score: 1 },
        { constrol_framework: 'iso', control: '11.02', score: 1 },
        { constrol_framework: 'iso', control: '11.03', score: 1 },
        { constrol_framework: 'iso', control: '11.04', score: 1 },
        { constrol_framework: 'iso', control: '11.05', score: 1 },
        { constrol_framework: 'iso', control: '12.01', score: 1 },
        { constrol_framework: 'iso', control: '12.02', score: 1 },
        { constrol_framework: 'iso', control: '12.03', score: 1 },
        { constrol_framework: 'iso', control: '12.04', score: 1 },
        { constrol_framework: 'iso', control: '12.05', score: 1 },
        { constrol_framework: 'iso', control: '12.06', score: 1 },
        { constrol_framework: 'iso', control: '12.07', score: 1 },
        { constrol_framework: 'iso', control: '12.08', score: 1 },
        { constrol_framework: 'iso', control: '13.01', score: 1 },
        { constrol_framework: 'iso', control: '13.02', score: 1 },
        { constrol_framework: 'iso', control: '13.03', score: 1 },
        { constrol_framework: 'iso', control: '13.04', score: 1 },
        { constrol_framework: 'iso', control: '13.05', score: 1 },
        { constrol_framework: 'iso', control: '13.06', score: 1 },
        { constrol_framework: 'iso', control: '13.07', score: 1 },
        { constrol_framework: 'iso', control: '13.08', score: 1 },
        { constrol_framework: 'iso', control: '13.09', score: 1 },
        { constrol_framework: 'iso', control: '13.10', score: 1 },
        { constrol_framework: 'iso', control: '13.11', score: 1 },
        { constrol_framework: 'iso', control: '14.01', score: 1 },
        { constrol_framework: 'iso', control: '14.02', score: 1 },
        { constrol_framework: 'iso', control: '14.03', score: 1 },
        { constrol_framework: 'iso', control: '14.04', score: 1 },
        { constrol_framework: 'iso', control: '14.05', score: 1 },
        { constrol_framework: 'iso', control: '14.06', score: 1 },
        { constrol_framework: 'iso', control: '14.07', score: 1 },
        { constrol_framework: 'iso', control: '14.08', score: 1 },
        { constrol_framework: 'iso', control: '14.09', score: 1 },
        { constrol_framework: 'iso', control: '15.01', score: 1 },
        { constrol_framework: 'iso', control: '15.02', score: 1 },
        { constrol_framework: 'iso', control: '15.03', score: 1 },
        { constrol_framework: 'iso', control: '15.04', score: 1 },
        { constrol_framework: 'iso', control: '15.05', score: 1 },
        { constrol_framework: 'iso', control: '15.06', score: 1 },
        { constrol_framework: 'iso', control: '15.07', score: 1 },
        { constrol_framework: 'iso', control: '16.01', score: 1 },
        { constrol_framework: 'iso', control: '16.02', score: 1 },
        { constrol_framework: 'iso', control: '16.03', score: 1 },
        { constrol_framework: 'iso', control: '16.04', score: 1 },
        { constrol_framework: 'iso', control: '16.05', score: 1 },
        { constrol_framework: 'iso', control: '16.06', score: 1 },
        { constrol_framework: 'iso', control: '16.07', score: 1 },
        { constrol_framework: 'iso', control: '16.08', score: 1 },
        { constrol_framework: 'iso', control: '16.09', score: 1 },
        { constrol_framework: 'iso', control: '16.10', score: 1 },
        { constrol_framework: 'iso', control: '16.11', score: 1 },
        { constrol_framework: 'iso', control: '16.12', score: 1 },
        { constrol_framework: 'iso', control: '16.13', score: 1 },
        { constrol_framework: 'iso', control: '16.14', score: 1 },
        { constrol_framework: 'iso', control: '17.01', score: 1 },
        { constrol_framework: 'iso', control: '17.02', score: 1 },
        { constrol_framework: 'iso', control: '17.03', score: 1 },
        { constrol_framework: 'iso', control: '17.04', score: 1 },
        { constrol_framework: 'iso', control: '17.05', score: 1 },
        { constrol_framework: 'iso', control: '18.01', score: 1 },
        { constrol_framework: 'iso', control: '18.02', score: 1 },
        { constrol_framework: 'iso', control: '18.03', score: 1 },
        { constrol_framework: 'iso', control: '18.04', score: 1 },
        { constrol_framework: 'iso', control: '18.05', score: 1 },

        { constrol_framework: 'hipaa', control: '1.01', score: 1 },
        { constrol_framework: 'hipaa', control: '1.02', score: 1 },
        { constrol_framework: 'hipaa', control: '1.03', score: 1 },
        { constrol_framework: 'hipaa', control: '1.04', score: 1 },
        { constrol_framework: 'hipaa', control: '1.05', score: 1 },
        { constrol_framework: 'hipaa', control: '2.01', score: 1 },
        { constrol_framework: 'hipaa', control: '2.02', score: 1 },
        { constrol_framework: 'hipaa', control: '2.03', score: 1 },
        { constrol_framework: 'hipaa', control: '2.04', score: 1 },
        { constrol_framework: 'hipaa', control: '2.05', score: 1 },
        { constrol_framework: 'hipaa', control: '2.06', score: 1 },
        { constrol_framework: 'hipaa', control: '2.07', score: 1 },
        { constrol_framework: 'hipaa', control: '3.01', score: 1 },
        { constrol_framework: 'hipaa', control: '3.02', score: 1 },
        { constrol_framework: 'hipaa', control: '3.03', score: 1 },
        { constrol_framework: 'hipaa', control: '3.04', score: 1 },
        { constrol_framework: 'hipaa', control: '3.05', score: 1 },
        { constrol_framework: 'hipaa', control: '3.06', score: 1 },
        { constrol_framework: 'hipaa', control: '3.07', score: 1 },
        { constrol_framework: 'hipaa', control: '3.08', score: 1 },
        { constrol_framework: 'hipaa', control: '3.09', score: 1 },
        { constrol_framework: 'hipaa', control: '3.10', score: 1 },
        { constrol_framework: 'hipaa', control: '3.11', score: 1 },
        { constrol_framework: 'hipaa', control: '3.12', score: 1 },
        { constrol_framework: 'hipaa', control: '3.13', score: 1 },
        { constrol_framework: 'hipaa', control: '3.14', score: 1 },
        { constrol_framework: 'hipaa', control: '4.01', score: 1 },
        { constrol_framework: 'hipaa', control: '4.02', score: 1 },
        { constrol_framework: 'hipaa', control: '4.03', score: 1 },
        { constrol_framework: 'hipaa', control: '4.04', score: 1 },
        { constrol_framework: 'hipaa', control: '4.05', score: 1 },
        { constrol_framework: 'hipaa', control: '4.06', score: 1 },
        { constrol_framework: 'hipaa', control: '4.07', score: 1 },
        { constrol_framework: 'hipaa', control: '4.08', score: 1 },
        { constrol_framework: 'hipaa', control: '4.09', score: 1 },
        { constrol_framework: 'hipaa', control: '4.10', score: 1 },
        { constrol_framework: 'hipaa', control: '4.11', score: 1 },
        { constrol_framework: 'hipaa', control: '4.12', score: 1 },
        { constrol_framework: 'hipaa', control: '5.01', score: 1 },
        { constrol_framework: 'hipaa', control: '5.02', score: 1 },
        { constrol_framework: 'hipaa', control: '5.03', score: 1 },
        { constrol_framework: 'hipaa', control: '5.04', score: 1 },
        { constrol_framework: 'hipaa', control: '5.05', score: 1 },
        { constrol_framework: 'hipaa', control: '5.06', score: 1 },
        { constrol_framework: 'hipaa', control: '6.01', score: 1 },
        { constrol_framework: 'hipaa', control: '6.02', score: 1 },
        { constrol_framework: 'hipaa', control: '6.03', score: 1 },
        { constrol_framework: 'hipaa', control: '6.04', score: 1 },
        { constrol_framework: 'hipaa', control: '6.05', score: 1 },
        { constrol_framework: 'hipaa', control: '6.06', score: 1 },
        { constrol_framework: 'hipaa', control: '6.07', score: 1 },
        { constrol_framework: 'hipaa', control: '6.08', score: 1 },
        { constrol_framework: 'hipaa', control: '7.01', score: 1 },
        { constrol_framework: 'hipaa', control: '7.02', score: 1 },
        { constrol_framework: 'hipaa', control: '7.03', score: 1 },
        { constrol_framework: 'hipaa', control: '7.04', score: 1 },
        { constrol_framework: 'hipaa', control: '7.05', score: 1 },
        { constrol_framework: 'hipaa', control: '7.06', score: 1 },
        { constrol_framework: 'hipaa', control: '7.07', score: 1 },
        { constrol_framework: 'hipaa', control: '8.01', score: 1 },
        { constrol_framework: 'hipaa', control: '8.02', score: 1 },
        { constrol_framework: 'hipaa', control: '8.03', score: 1 },
        { constrol_framework: 'hipaa', control: '8.04', score: 1 },
        { constrol_framework: 'hipaa', control: '8.05', score: 1 },
        { constrol_framework: 'hipaa', control: '8.06', score: 1 },
        { constrol_framework: 'hipaa', control: '8.07', score: 1 },
        { constrol_framework: 'hipaa', control: '8.08', score: 1 },
        { constrol_framework: 'hipaa', control: '8.09', score: 1 },
        { constrol_framework: 'hipaa', control: '8.10', score: 1 },
        { constrol_framework: 'hipaa', control: '8.11', score: 1 },
        { constrol_framework: 'hipaa', control: '8.12', score: 1 },
        { constrol_framework: 'hipaa', control: '9.01', score: 1 },
        { constrol_framework: 'hipaa', control: '9.02', score: 1 },
        { constrol_framework: 'hipaa', control: '9.03', score: 1 },
        { constrol_framework: 'hipaa', control: '9.04', score: 1 },
        { constrol_framework: 'hipaa', control: '9.05', score: 1 },
        { constrol_framework: 'hipaa', control: '9.06', score: 1 },
        { constrol_framework: 'hipaa', control: '10.01', score: 1 },
        { constrol_framework: 'hipaa', control: '10.02', score: 1 },
        { constrol_framework: 'hipaa', control: '10.03', score: 1 },
        { constrol_framework: 'hipaa', control: '10.04', score: 1 },
        { constrol_framework: 'hipaa', control: '10.05', score: 1 },
        { constrol_framework: 'hipaa', control: '11.01', score: 1 },
        { constrol_framework: 'hipaa', control: '11.02', score: 1 },
        { constrol_framework: 'hipaa', control: '11.03', score: 1 },
        { constrol_framework: 'hipaa', control: '11.04', score: 1 },
        { constrol_framework: 'hipaa', control: '11.05', score: 1 },
        { constrol_framework: 'hipaa', control: '11.06', score: 1 },
        { constrol_framework: 'hipaa', control: '11.07', score: 1 },
        { constrol_framework: 'hipaa', control: '12.01', score: 1 },
        { constrol_framework: 'hipaa', control: '12.02', score: 1 },
        { constrol_framework: 'hipaa', control: '12.03', score: 1 },
        { constrol_framework: 'hipaa', control: '12.04', score: 1 },
        { constrol_framework: 'hipaa', control: '12.05', score: 1 },
        { constrol_framework: 'hipaa', control: '12.06', score: 1 },
        { constrol_framework: 'hipaa', control: '12.07', score: 1 },
        { constrol_framework: 'hipaa', control: '13.01', score: 1 },
        { constrol_framework: 'hipaa', control: '13.02', score: 1 },
        { constrol_framework: 'hipaa', control: '13.03', score: 1 },
        { constrol_framework: 'hipaa', control: '13.04', score: 1 },
        { constrol_framework: 'hipaa', control: '13.05', score: 1 },
        { constrol_framework: 'hipaa', control: '14.01', score: 1 },
        { constrol_framework: 'hipaa', control: '14.02', score: 1 },
        { constrol_framework: 'hipaa', control: '14.03', score: 1 },
        { constrol_framework: 'hipaa', control: '14.04', score: 1 },
        { constrol_framework: 'hipaa', control: '14.05', score: 1 },
        { constrol_framework: 'hipaa', control: '15.01', score: 1 },
        { constrol_framework: 'hipaa', control: '15.02', score: 1 },
        { constrol_framework: 'hipaa', control: '15.03', score: 1 },
        { constrol_framework: 'hipaa', control: '15.04', score: 1 },
        { constrol_framework: 'hipaa', control: '15.05', score: 1 },
        { constrol_framework: 'hipaa', control: '16.01', score: 1 },
        { constrol_framework: 'hipaa', control: '16.02', score: 1 },
        { constrol_framework: 'hipaa', control: '16.03', score: 1 },
        { constrol_framework: 'hipaa', control: '16.04', score: 1 },
        { constrol_framework: 'hipaa', control: '17.01', score: 1 },
        { constrol_framework: 'hipaa', control: '17.02', score: 1 },
        { constrol_framework: 'hipaa', control: '17.03', score: 1 },
        { constrol_framework: 'hipaa', control: '17.04', score: 1 },
        { constrol_framework: 'hipaa', control: '17.05', score: 1 },
        { constrol_framework: 'hipaa', control: '18.01', score: 1 },
        { constrol_framework: 'hipaa', control: '18.02', score: 1 },
        { constrol_framework: 'hipaa', control: '18.03', score: 1 },
        { constrol_framework: 'hipaa', control: '18.04', score: 1 },
        { constrol_framework: 'hipaa', control: '18.05', score: 1 }


    ]

    const base = "cis";
    const many = ["cis", "iso", "hipaa"];
    let resultArray = [];
    
    try {
      for (const framework of many) { // Use `for...of` for arrays
        let totalScore = 0;
        const result = await Book2.findAll({
          where: { Control_Framework: framework },
          attributes: [
            'Control_Framework',
            'controls',
            'score',
            'CIS_Equivalent',
            'ISO_Equivalent',
            'HIPAA_Equivalent'
          ]
        });
        const iso = result.length;
        // console.log(iso);
    
        const mappedPromises = result.map(async (item) => {
          const foundControl = data.find(item1 =>
            item1.control !== item.dataValues.controls &&
            item1.control_framework !== item.dataValues.Control_Framework
          );
          if (foundControl?.score > 0) {
            const referenceScore = parseFloat(item.dataValues.score);
            const equivalentScore = base === "iso"
            ? item.dataValues.ISO_Equivalent
            : base === "cis"
              ? item.dataValues.CIS_Equivalent
              : item.dataValues.HIPAA_Equivalent;
                      totalScore += equivalentScore / referenceScore;
          }
        });
    
        await Promise.all(mappedPromises);
        const percentage = Math.ceil((totalScore / iso) * 100);
        resultArray.push({ framework, percentage, compared_To: base });
      }
    
      res.status(200).json(resultArray);
    } catch (error) {
      console.log(error);
    }
    

}
