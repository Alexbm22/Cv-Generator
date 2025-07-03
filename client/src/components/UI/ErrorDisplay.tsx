import { AppError } from "../../services/Errors"

interface componentProps {
    error: AppError;
    key: number;
}

// !!! to be improved: needs icon customization for each type of error
const ErrorDisplay: React.FC<componentProps> = ({error, key}: componentProps) => {
    
    // to do: improve component styling
    return (
        <div key={key} className="bg-red-500">
            <h2 className="text-red-300">{error.errType}</h2>
            <h3 className="text-red-300">{error.message}</h3>
        </div>
    )
}

export default ErrorDisplay;