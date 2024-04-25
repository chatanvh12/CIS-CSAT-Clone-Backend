import { Sequelize } from "sequelize";
import sequelize from "../config/DB.js";

const Attribute = sequelize.define('Attribute', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    attribute_name: Sequelize.STRING
    // Other attribute-related fields
},{
    timestamps:false
});


Attribute.sync({alter:true});

export default Attribute;