import { useContext } from 'react';
import { AlertContext } from '../contexts/AlertContext';

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert deve ser usado dentro de um AlertProvider');
  }
  return context;
};