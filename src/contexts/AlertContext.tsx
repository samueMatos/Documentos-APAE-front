// src/contexts/AlertContext.tsx
import { createContext, useState, ReactNode, useCallback, useRef, useEffect } from 'react'; // 1. Importe useRef e useEffect
import { AlertModal, AlertType } from '../components/modals/AlertModal';

// Interfaces (sem alterações)
interface AlertState {
  show: boolean;
  message: string;
  title: string;
  type: AlertType;
}

interface AlertContextType {
  showAlert: (message: string, title: string, type: AlertType) => void;
}

export const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    show: false,
    message: '',
    title: '',
    type: 'info',
  });
  const timerRef = useRef<number | null>(null);


  const handleClose = useCallback(() => {

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setAlertState((prevState) => ({ ...prevState, show: false }));
  }, []);

  const showAlert = useCallback((message: string, title: string, type: AlertType) => {

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setAlertState({ show: true, message, title, type });

    timerRef.current = setTimeout(() => {
      handleClose();
    }, 3000);
  }, [handleClose]); 


  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);


  const contextValue = {
    showAlert,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      
      <AlertModal
        show={alertState.show}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={handleClose}
      />
    </AlertContext.Provider>
  );
};