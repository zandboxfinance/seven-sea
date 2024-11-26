import React, { useState, useEffect } from 'react';

interface PrimeInputProps {
  value: string;
  setValue: (value: string) => void;
  validatePrime: (value: string, setValue: (value: string) => void) => void;
  className?: string;
}

const PrimeInput: React.FC<PrimeInputProps> = ({ value, setValue, validatePrime, className }) => {
  const [isChanging, setIsChanging] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value;

    // Allow only numbers and a single decimal point
    newValue = newValue.replace(/[^0-9.]/g, ''); // Remove invalid characters
    const parts = newValue.split('.');

    // If more than one decimal, retain only the first one
    if (parts.length > 2) {
      newValue = parts[0] + '.' + parts[1]; // Rejoin the first two parts
    }

    // Update the state with the cleaned value
    setValue(newValue);

    // Trigger the highlight effect
    setIsChanging(true);
  };

  const handleBlur = () => {
    validatePrime(value, setValue);
  };

  useEffect(() => {
    const timeout = setTimeout(() => setIsChanging(false), 300); // Reset highlight effect
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      type="text"
      pattern="[0-9.]*"
      className={`${className} text-white bg-gray-800 outline-none rounded text-right p-2 w-[100%]
                  transition-transform duration-300 ease-out transform
                  ${isChanging ? 'text-yellow-400 scale-105' : 'text-white scale-100'}
                  focus:ring-4 focus:ring-blue-300`}
      value={value}
      onChange={handleInputChange}
      onBlur={handleBlur}
      style={{
        transition: 'color 0.3s ease, transform 0.3s ease',
      }}
    />
  );
};

export default PrimeInput;
