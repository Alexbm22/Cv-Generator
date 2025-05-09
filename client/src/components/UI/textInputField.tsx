import React from 'react';

interface InputFieldProps {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}

const TextInputField: React.FC<InputFieldProps> = ({id, label, placeholder, value, onChange, type}) => {
    return (
        <div className="flex flex-col space-y-2 w-full">
            <label htmlFor={id} className="text-base text-gray-600 font-bold">{label}</label>
            <input
                id={id}
                type={type || 'text'}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full font-medium text-gray-600 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
            />
        </div>
    )
}

export default TextInputField;