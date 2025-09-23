import React from 'react';

interface InputFieldProps {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    name?: string;
}

const TextInputField: React.FC<InputFieldProps> = ({id, label, placeholder, value, onChange, type, name}) => {
    return (
        <div className="flex flex-col space-y-2 w-full">
            <label htmlFor={id} className="text-base text-[#154D71] font-bold">{label}</label>
            <input
                id={id}
                type={type ?? 'text'}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                name={name ?? 'input'}
                className="w-full h-11 font-medium bg-[#eff9ff] text-gray-600 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#33A1E0] focus:border-[#33A1E0] transition"
            />
        </div>
    )
}

export default TextInputField;