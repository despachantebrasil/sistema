import React from 'react';

interface UppercaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    // O onChange deve ser o padrão para que o componente pai possa usá-lo
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean; 
}

const UppercaseInput: React.FC<UppercaseInputProps> = ({ onChange, ...props }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Modifica o valor do target para maiúsculas antes de chamar o onChange do pai
        e.target.value = e.target.value.toUpperCase();
        
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <input
            {...props}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm uppercase"
            style={{ textTransform: 'uppercase' }}
        />
    );
};

export default UppercaseInput;