import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/DB.js';
import Organizations from './organizations.js';
import profilepic from './profilepic.js';
import roles from './role.js';
import Attribute from './Attributes.js';

const User = sequelize.define('User', {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    profilepicid:{
      type:DataTypes.INTEGER
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING
    },
    // rolesId:{
    //     type:DataTypes.INTEGER,
    //     // allowNull:false
    // },
    tokens: {
        type: DataTypes.JSONB,
        // allowNull: false,
        defaultValue: {}
    }
}, {
    tableName: "User",
    // schema: 'public'
});

export const UserOrganization = sequelize.define('UserOrganization', {
   
}, { timestamps: false,tableName:'UserOrganizations' });

User.belongsToMany(Organizations, { through: UserOrganization});
Organizations.belongsToMany(User, { through: UserOrganization });

User.hasOne(profilepic, { foreignKey: 'profilepicid' });
profilepic.belongsTo(User, { targetKey: 'profilepicid' });

User.sync({alter:true}).then(() => {
    console.log("Tables synced successfully");
}).catch(err => {
    console.error("Error syncing tables:", err);
});
export const UserRole = sequelize.define('UserRole', {
    // additional attributes can go here, such as date assigned, etc.
  },{
    timestamps:false
  });
  
  User.belongsToMany(roles, { through: UserRole });
  roles.belongsToMany(User, { through: UserRole });

UserOrganization.sync({alter:true}).then(() => {
    console.log("Tables synced successfully");
}).catch(err => {
    console.error("Error syncing tables:", err);
});
// Define the association
const UserAttribute = sequelize.define('UserAttribute', {

},{
    timestamps:false
});

User.belongsToMany(Attribute, { through: 'UserAttribute'});
Attribute.belongsToMany(User, { through: 'UserAttribute'});

// Sync the models
await UserAttribute.sync({alter:true});
await UserRole.sync({ alter: true });
export default User;
