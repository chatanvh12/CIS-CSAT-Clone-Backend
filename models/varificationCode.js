import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";
import User from "./user.js";

const VerificationCode = sequelize.define('VerificationCode', {
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
},{
  timestamps:false,
  tableName:'VerificationCodes'
});

// VerificationCode.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });


VerificationCode.sync({alter:true});
export default VerificationCode;