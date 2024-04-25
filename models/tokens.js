// const { DataTypes } = require("sequelize");
// const  sequelize  = require("../config/DB");

import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";

const Token = sequelize.define("Token", {
    // userId: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    // },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

// export default Token;