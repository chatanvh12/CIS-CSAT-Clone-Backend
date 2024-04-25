import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";

const Book2 = sequelize.define('Book2', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    Control_Framework: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    controls: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false
    },
    score: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: false
    },
    CIS_Equivalent: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false
    },
    ISO_Equivalent: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false
    },
    HIPAA_Equivalent: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false
    }

}, {
    tableName: "Book2",
    timestamps: false
});

// Sync the model with the database (this is usually done at application startup)
Book2.sync().then(() => {
    console.log('Database synchronized');
}).catch(error => {
    console.error('Error synchronizing database:', error);
}).finally(() => {
    // Close the database connection
    //   sequelize.close();
});

export default Book2;