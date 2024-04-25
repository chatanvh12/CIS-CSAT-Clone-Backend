import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";
import Organization from "./organizations.js";
import assessment_task from "./Assessment_tasks.js";


const Assessment = sequelize.define("assessment", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    OrganizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Organizations',
            key: "id"
        }
    },

    framework: {
        type: DataTypes.INTEGER
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('open', 'In Progress', 'copleted', 'Reviewed'),
        allowNull: false
    },
    scoring_method: {
        type: DataTypes.ENUM('simple', 'Custom')
    },
    overall_score: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'Assessments'
});
//connection with organizations
// Organization.hasMany(Assessment);
// Assessment.belongsTo(Organization, { foreignKey: 'OrganizationId' });

// //connection with assessment_task
// Assessment.hasMany(assessment_task, {
//     onDelete: 'CASCADE', // Cascade delete if an Assessment is deleted
//     onUpdate: 'CASCADE', // Cascade update if an Assessment is updated
//     foreignKey: {
//         allowNull:false,
//         name:'assessmentid',
//     }, // Use the 'assessment_fk' column in AssessmentTask as the foreign key
// });

// // Add a foreign key reference from AssessmentTask to Assessment
// assessment_task.belongsTo(Assessment, {
//     foreignKey:'assessmentid', // Use the 'assessment_fk' column in AssessmentTask as the foreign key
// });
// Assessment.sync({alter:true});
export default Assessment;