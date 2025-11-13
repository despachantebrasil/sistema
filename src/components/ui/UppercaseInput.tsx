import React from 'react';

interface UppercaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    // Adicionando 'required' explicitamente para garantir que seja opcional por padrão
    required?: boolean; 
}

const UppercaseInput: React.FC<UppercaseInputProps> = ({ onChange, value, ...props }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Converte o valor para maiúsculas
        const upperCaseValue = e.target.value.toUpperCase();
        
        // Cria um novo evento sintético com o valor em maiúsculas
        const syntheticEvent = {
            ...e,
            target: {
                ...e.target,
                value: upperCaseValue,
            },
        } as React.ChangeEvent<HTMLInputElement>;

        if (onChange) {
            onChange(syntheticEvent);
        }
    };

    return (
        <input
            {...props}
            value={value}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm uppercase"
            style={{ textTransform: 'uppercase' }}
        />
    );
};

export default UppercaseInput;