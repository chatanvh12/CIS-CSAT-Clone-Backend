import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";
import securityCompliance from "./securityComplience.js";
import controlsversion from "./copy_of_cis_controls_version_8_1.js";
import assessment_task from "./Assessment_tasks.js";

const Organization = sequelize.define("Organization", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orgName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  website: {
    type: DataTypes.STRING,
    allowNull: false
  },
  industryType: {
    type: DataTypes.STRING
  },
  group: {
    type: DataTypes.INTEGER,
    // allowNull: false
  },
  controlVersion: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  terms: {
    type: DataTypes.BOOLEAN,
    // allowNull: false
  },
}, {
  timestamps: false
});

// module.exports = Organization;
// Junction table for many-to-many relationship between Organization and SecurityControl
export const OrganizationSecurityControl = sequelize.define('OrganizationSecurityControl', {
  OrganizationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Organization',
      key: 'id'
    }
  },
  controlsversionId: { // Assuming cis_safeguard is a unique identifier
    type: DataTypes.STRING, // Change type if needed based on your data
    allowNull: false,
    unique: true, // Ensure uniqueness of control association for an organization
    references: {
      model: 'controlsversion',
      key: 'cis_safeguard'
    }
  }
}, {
  timestamps: false
});

// Define associations
Organization.belongsToMany(controlsversion, { through: OrganizationSecurityControl, foreignKey: "OrganizationId" });
controlsversion.belongsToMany(Organization, { through: OrganizationSecurityControl, foreignKey: "controlsversionId" });

Organization.hasMany(assessment_task, {
  onDelete: 'CASCADE', // If an organization is deleted, delete all its tasks
  foreignKey: {
    allowNull: false
  }
});
assessment_task.belongsTo(Organization);


OrganizationSecurityControl.sync();
Organization.sync({ alter: true }); // Use this line carefully, as it will drop and re-create the table

export default Organization;
