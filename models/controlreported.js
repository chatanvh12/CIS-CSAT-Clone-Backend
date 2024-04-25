import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";

const controlreported=sequelize.define("policy",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
    }
},{
    timestamps:false,
    tableName:'controlreported'
});

export default controlreported;