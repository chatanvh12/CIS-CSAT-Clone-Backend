import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";
import controlautomated from "./controlautomated.js";
import controlImplemented from "./controlImplemented.js";
import controlreported from "./controlreported.js";
import proofofwork from "./proofofwork.js";
import policy from "./policyDefined.js";
// contr
const assessment_task = sequelize.define("assessmettask", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true
    },
    controlsversionCisSafeguard:{
       type:DataTypes.STRING,
    },
    OrganizationId: {
        type: DataTypes.INTEGER
    },
    controlautomatedid: {
        type: DataTypes.INTEGER
    },
    controlimplementedid: {
        type: DataTypes.INTEGER
    },
    controlreportedid: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.STRING,
    },
    duedate: {
        type: DataTypes.DATE
    },
    assignedby: {
        type: DataTypes.STRING
    },
    assignedto: {
        type: DataTypes.STRING
    },
    validatedby: {
        type: DataTypes.STRING
    },
    completedby: {
        type: DataTypes.STRING
    },
    note: {
        type: DataTypes.TEXT,
    },
    proofofworkid:{
        type:DataTypes.INTEGER,
    },
    policydefinedid:{
        type:DataTypes.INTEGER,
    }
}, {
    timestamps: false,
    tableName: 'assessmettask'
})

// assessment_task.hasOne(controlautomated, { foreignKey: 'controlautomatedid' });
// controlautomated.belongsTo(assessment_task, { targetKey: 'controlautomatedid' });

// assessment_task.hasOne(controlImplemented, { foreignKey: 'controlimplementedid' });
// controlImplemented.belongsTo(assessment_task, { targetKey: 'controlimplementedid' });

// assessment_task.hasOne(policy, { foreignKey: 'policydefinedid' });
// policy.belongsTo(assessment_task, { targetKey: 'policydefinedid' });


// assessment_task.hasOne(proofofwork, { foreignKey: 'proofofworkid' });
// proofofwork.belongsTo(assessment_task, { targetKey: 'proofofworkid' });


// assessment_task.hasOne(controlreported, { foreignKey: 'controlreportedid' });
// controlreported.belongsTo(assessment_task, { targetKey: 'controlreportedid' });

assessment_task.sync({alter:true});

export default assessment_task;