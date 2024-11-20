import React, { useState, useEffect } from 'react';

interface PrimeInputProps {
  value: string;
  setValue: (value: string) => void;
  validatePrime: (value: string, setValue: (value: string) => void) => void;
  className?: string;
}

const PrimeInput: React.FC<PrimeInputProps> = ({ value, setValue, validatePrime, className }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isChanging, setIsChanging] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value.replace(/[^0-9.]/g, '');
    setValue(newValue);
  };

  const handleBlur = () => {
    validatePrime(value, setValue);
  };

  const formatNumber = (num: string) => {
    const [intPart, decimalPart] = num.split('.');
    return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (decimalPart ? `.${decimalPart}` : '');
  };

  useEffect(() => {
    setDisplayValue(formatNumber(value));
    setIsChanging(true);
    const timeout = setTimeout(() => setIsChanging(false), 300);
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
      value={displayValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      style={{
        transition: 'color 0.3s ease, transform 0.3s ease',
      }}
    />
  );
};

export default PrimeInput;
