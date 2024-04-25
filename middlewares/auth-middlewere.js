import jwt from "jsonwebtoken";
import User from "../models/user.js";
import process from 'process'
export const cheakUserAuth = async (req, res, next) => {
    let token;
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith('Bearer')) {
        try {
            // Get Token from header
            token = authorization.split(' ')[1]

            // Verify Token
            const { id } = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await User.findOne({
                where: { id: id }
            });
            next()
        } catch (error) {
            console.log(error)
            res.status(401).send({ "status": "failed", "message": "Unauthorized User" })
        }
    }
    if (!token) {
        res.status(401).send({ "status": "failed", "message": "Unauthorized User, No Token" })
    }
}