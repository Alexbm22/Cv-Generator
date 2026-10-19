import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/DB/database_config';

class AiModelPrice extends Model {
    declare id: number;
    declare model_id: string;
    // DECIMAL columns are returned as strings to preserve precision.
    declare input_per_mtok: string;
    declare output_per_mtok: string;
    declare effective_from: Date;
    declare effective_to: Date | null;
}

AiModelPrice.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    model_id: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    input_per_mtok: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false,
    },
    output_per_mtok: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false,
    },
    effective_from: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    effective_to: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: 'ai_model_prices',
    timestamps: false,
    indexes: [
        {
            name: 'ai_model_prices_model_effective_from_idx',
            fields: ['model_id', 'effective_from'],
        },
    ],
});

export default AiModelPrice;
