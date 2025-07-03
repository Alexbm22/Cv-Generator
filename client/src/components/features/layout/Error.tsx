import React from "react";
import { useErrorStore } from "../../../Store";
import ErrorDisplay from "../../UI/ErrorDisplay";

const ErrorLayout: React.FC = () => {
    const errors = useErrorStore(state => state.errors);
    const errorsToShow = errors.filter((err) => !err.field);

    return (
        <>
            <div className="absolute">
                {
                    errorsToShow.map((error, key) => 
                        <ErrorDisplay error={error} key={key}/>
                    )
                }
            </div>
        </>
    )
}

export default ErrorLayout;