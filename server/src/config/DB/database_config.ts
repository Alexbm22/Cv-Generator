import { Sequelize, Options } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const dbConfig: Options = {
    dialect: "mysql",
    port: Number(process.env.DB_PORT) || 3306,
    host: process.env.DB_HOST || "localhost",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    retry: { max: 3 },
    timezone: "+00:00",
    benchmark: process.env.NODE_ENV === 'development'

    // SSL configuration for secure connection
    // dialectOptions: {
    //     ssl: {
    //         require: true,
    //         rejectUnauthorized: false
    //     }
    // },
}

const sequelize = new Sequelize(
    process.env.DB_NAME || "my_db",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || '',
    dbConfig
)

export default sequelize;