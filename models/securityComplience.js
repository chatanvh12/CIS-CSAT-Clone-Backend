import fs from 'fs';
import { DataTypes, INTEGER, Sequelize } from "sequelize";
import controlsversion from "./copy_of_cis_controls_version_8_1.js";
import sequelize from "../config/DB.js";

const securityCompliance = sequelize.define("securitycompliance", {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        // autoIncrement:true,
        // primaryKey:true,
        // unique: true,
    },
    version:{
        type:Sequelize.STRING,
        allowNull:false,
        // unique: true, 
        // primaryKey:true
    },
    complianceid:{
        type:DataTypes.STRING,
        // unique:true
        primaryKey:true
    },
    title:{
        type:DataTypes.TEXT
    },
    descriptions:{
        type:DataTypes.TEXT,
        allowNull:false
    },    
}, {
    timestamps: false,
    tableName: "compliancess",
});

securityCompliance.sync({ alter: true }).then((e) => {
    console.log("created successfully");
})

securityCompliance.hasMany(controlsversion,{foreignKey:'securitycomplianceid'});
controlsversion.belongsTo(securityCompliance,{foreignKey:'securitycomplianceid'});
export default securityCompliance;