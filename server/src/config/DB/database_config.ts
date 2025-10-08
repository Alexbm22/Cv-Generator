import { Sequelize, Options } from "sequelize";
import dotenv from "dotenv";
import { config } from "../env";
dotenv.config();

const dbConfig: Options = {
    dialect: "mysql",
    port: config.DB_PORT,
    host: config.DB_HOST,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false,
    retry: { max: 3 },
    timezone: "+00:00",
    benchmark: config.NODE_ENV === 'development'

    // SSL configuration for secure connection
    // dialectOptions: {
    //     ssl: {
    //         require: true,
    //         rejectUnauthorized: false
    //     }
    // },
}

const sequelize = new Sequelize(
    config.DB_NAME,
    config.DB_USER,
    config.DB_PASSWORD,
    dbConfig
)

export default sequelize;