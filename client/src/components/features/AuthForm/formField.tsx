import { useErrorStore } from '../../../Store';

interface componentProps {
    formOrigin: string;
    className?: string;
    name: string;
    label: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    children?: React.ReactNode;
}

const Field: React.FC<componentProps> = ({formOrigin, name, label, type, placeholder, value, onChange, className, children}: componentProps) => {

    const errors = useErrorStore(state => state.errors);
    const removeFieldError = useErrorStore(state => state.removeFieldError);
    const error = errors.find(error => error.field?.param === name && error.field?.formOrigin === formOrigin);

    return (
        <>
            <div className={`flex flex-col gap-1 w-full ${className}`}>
                <label htmlFor={name} className="text-base text-gray-600 font-bold">{label}</label>
                <div className="relative w-full">
                    <input
                        id={name}
                        type={type ?? 'text'}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => {
                            onChange(e)
                            removeFieldError({
                                param: name,
                                formOrigin: formOrigin
                            });
                        }}
                        name={name ?? 'input'}
                        className="w-full h-11 font-medium text-gray-600 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                    {children && (
                        <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                            {children}
                        </div>
                    )}
                </div>
                {error?.message && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                )}
            </div>
        </>
    )
}

export default Field;