import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";

const controlautomated=sequelize.define("policy",{
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
    tableName:'controlautomated'
});


export default controlautomated;
