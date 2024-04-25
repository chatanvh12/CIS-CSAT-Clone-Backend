import { DataTypes, Sequelize } from 'sequelize'
import sequelize from '../config/DB.js';
import assessment_task from './Assessment_tasks.js';

const controlsversion=sequelize.define("controlsversion",{
    cis_safeguard:{
        type:DataTypes.STRING,
        allowNull:false,
        // unique:true
        primaryKey:true
    },
    title:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    securitycomplianceid:{
        type:DataTypes.STRING, 
        // allowNull:false,
        references:{
            model:'compliancess',
            key:'complianceid'
        }
    },
    controlversion: {
        type: DataTypes.STRING,
        // allowNull: false,
    },
    assetype:{
        type:DataTypes.STRING,
        // allowNull:false
    },
    securityfunction:{
        type:DataTypes.STRING,
        // allowNull:false
    }
},{
    timestamps:false,
    tableName:"controlsversions"
});

controlsversion.hasOne(assessment_task);
assessment_task.belongsTo(controlsversion);


controlsversion.sync({ alter: true }).then((e) => {
    // console.log("created successfully");
});


export default controlsversion;

