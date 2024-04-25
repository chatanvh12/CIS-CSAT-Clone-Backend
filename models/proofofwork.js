import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";

const proofofwork = sequelize.define("proofofwork", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    empid: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    taskid: {
        type: DataTypes.INTEGER,
        allowNull: false
    }

})

export default proofofwork;