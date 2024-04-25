// const pg=require('pg');
import pg from 'pg';
import process from "process";
import { Sequelize } from 'sequelize';
// const { Sequelize } = require('sequelize');
import dotenv from 'dotenv';
import { log } from 'console';
dotenv.config();

// const pool=new pg.Pool({
//     user: process.env.PGUSER,
//     password: process.env.PGPASSWORD,
//     host: process.env.PGHOST, // Specify your PostgreSQL host
//     database: process.env.PGDATABASE, // Specify your PostgreSQL database
//     port: process.env.PGPORT, // Specify your PostgreSQL port
// })
const database=process.env.PGDATABASE;
const username=process.env.PGUSER;
const password=process.env.PGPASSWORD;
const host= process.env.PGHOST;
const sequelize = new Sequelize(`${database}`, `${username}`, `${password}`, {
    
    host: `${host}`,
    dialect: 'postgres',
});
export default sequelize;