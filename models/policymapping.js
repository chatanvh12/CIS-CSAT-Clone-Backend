import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";

const policymapping=sequelize.define("policymapping",{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrementIdentity: true
      },
      name:{
        type:DataTypes.STRING,
        allowNull:false
      }
},{
    timestamps:false,
    tableName:"policymapping"
});

// sequelize.sync({ alter: true }).then((e) => {
//     console.log("created successfully");
// })
// export default policymapping;