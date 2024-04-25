import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";
import Attribute from "./Attributes.js";

const roles=sequelize.define("roles",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    role:{
        type:DataTypes.STRING,
    }
},{
    timestamps:false,
    tableName:'roles'
});

export  const RoleAttributes=sequelize.define("RoleAttributes",{
  
},{
    timestamps:false
});
roles.belongsToMany(Attribute, { through: 'RoleAttributes' });
Attribute.belongsToMany(roles, { through: 'RoleAttributes' });

RoleAttributes.sync({alter:true});
roles.sync({alter:true});
export default roles;