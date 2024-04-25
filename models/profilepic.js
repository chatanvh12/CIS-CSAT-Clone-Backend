import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";

const profilepic=sequelize.define("profilepic",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    url:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{
    timestamps:false,
    tableName:'policies'
});

export default profilepic;