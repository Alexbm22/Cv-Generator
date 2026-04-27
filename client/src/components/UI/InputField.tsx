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

const InputField: React.FC<InputFieldProps> = ({id, label, placeholder, value, onChange, type, name}) => {
    return (
        <div className="flex flex-col space-y-1.5 w-full">
            <label htmlFor={id} className="text-sm text-[#1d1d1f] font-medium">{label}</label>
            <input
                id={id}
                type={type ?? 'text'}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                name={name ?? 'input'}
                className="w-full h-11 font-medium bg-white text-[#1d1d1f] px-4 py-2 border border-[#d2d2d7] rounded-xl shadow-none focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:border-[#0071e3] placeholder-[#9c9ca4] transition"
            />
        </div>
    )
}

export default InputField;