
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-700/30 border border-red-600 text-red-300 px-4 py-3 rounded-md relative" role="alert">
      <strong className="font-semibold text-red-200">Error:</strong>
      <span className="block sm:inline ml-2">{message}</span>
    </div>
  );
};
