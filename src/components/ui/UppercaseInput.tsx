import React from 'react';

interface UppercaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // O valor e o onChange são obrigatórios para inputs controlados
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UppercaseInput: React.FC<UppercaseInputProps> = ({ onChange, ...props }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Converte o valor para maiúsculas antes de chamar o onChange original
    e.target.value = e.target.value.toUpperCase();
    onChange(e);
  };

  // Classes base para inputs, replicando o estilo padrão
  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

  return (
    <input
      {...props}
      onChange={handleInputChange}
      className={`${inputClasses} ${props.className || ''}`}
      style={{ textTransform: 'uppercase' }} // Garante que o texto exibido seja maiúsculo
    />
  );
};

export default UppercaseInput;