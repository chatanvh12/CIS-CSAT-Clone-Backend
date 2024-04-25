import { DataTypes } from "sequelize";
import sequelize from "../config/DB";


const discussion=sequelize.define("discussion",{
   id:{
    type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true
   },
   empid:{
    type:DataTypes.INTEGER,
    allowNull:false
   },
   date:{
    type:DataTypes.DATE,
    allowNull:false
   },
   assessmentid:{
    type:DataTypes.INTEGER,
    allowNull:false
   },
   description:{
    type:DataTypes.TEXT,
    allowNull:false
   },
   discussionwith:{
    type:DataTypes.INTEGER,
    allowNull:false
   }
},{
    timestamps:false,
    tableName:'discussion'
});

export default discussion;