import { useErrorStore } from '../../../Store';

interface componentProps {
    id: string;
    name: string;
    label: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Field: React.FC<componentProps> = ({id, name, label, type, placeholder, value, onChange}: componentProps) => {

    const errors = useErrorStore(state => state.errors);
    const removeFieldError = useErrorStore(state => state.removeFieldError);
    const error = errors.find(error => error.field === name);

    return (
        <>
            <div className="flex flex-col space-y-2 w-full">
                <label htmlFor={id} className="text-base text-gray-600 font-bold">{label}</label>
                <input
                    id={id}
                    type={type ?? 'text'}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => {
                        onChange(e)
                        removeFieldError(name);
                    }}
                    name={name ?? 'input'}
                    className="w-full h-11 font-medium text-gray-600 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <p>{error?.message}</p>
            </div>
        </>
    )
}

export default Field;