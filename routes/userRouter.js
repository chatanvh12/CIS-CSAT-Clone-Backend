import express from "express";
import {registerController,getUsers, loginController, logOutController, changeUserPasswordController, loggedUser, sendUserPasswordResetEmail, verifyCodeAndLogin, addRole, getRole, updateRole, deleteRole, addRoleAttibutes, getRoleAttributes, getAttributes, getequivalent} from "../controllers/userController.js";
import { cheakUserAuth } from "../middlewares/auth-middlewere.js";
import { AllcomplianceController, complianceController, createassessment, generateSpiderWeb, generatepdf, generateppt, getMainCompliance, getOrgCompliances, getSubControls, getassessmenttask, orgCompliance, orgaddtask, orggetassessment } from "../controllers/complianceController.js";
import generatePDF from "../utils/generatePDF.js";

const router=express.Router();

router.post("/register",registerController);
router.post("/login",loginController);
router.post("/send-reset-password-email",sendUserPasswordResetEmail);
router.post("/logout",logOutController)
// router.get('/setpass',sendUserPasswordResetEmail)

router.get("/get",getUsers);
router.post('/changepassword',cheakUserAuth,changeUserPasswordController)
router.get("/getuser",cheakUserAuth,loggedUser);
router.post("/verifyLogin",verifyCodeAndLogin);

router.get("/compliance/:id",complianceController);
router.get("/getcomliance/:version",getMainCompliance);
router.get("/getSubsecurity/:id",getSubControls);
router.get("/allControls",AllcomplianceController);
router.post("/user-role",addRole);
router.get("/get-Role",getRole);
router.put("/update-role",updateRole);
router.delete("/delete-user",deleteRole);
router.post("/roleattribute",addRoleAttibutes);
router.get("/getattributes",getRoleAttributes);
router.get("/getallattributes",getAttributes);
router.get("/geteq",getequivalent);

router.post("/org-controls",orgCompliance);
router.get("/org-compliance",getOrgCompliances);
router.post("/org-assessment",createassessment);
router.get("/org-get-assessment/:id",orggetassessment);
router.post("/org-addtask",orgaddtask);
router.get("/org-gettask/:id",getassessmenttask);
router.get("/generatepdf",generatepdf);
router.get("/getppt",generateppt);
router.get("/gen-web",generateSpiderWeb);
//exclusely for Admin
//uploading new assessment file


export default(router);