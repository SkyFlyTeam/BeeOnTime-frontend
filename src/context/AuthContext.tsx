// import React, { createContext, useContext, useState, ReactNode } from "react";

// interface AuthContextType {
//   usuarioCargo: string;
//   usuarioCod: number;
//   setUsuarioCargo: (cargo: string) => void;
//   setUsuarioCod: (cod: number) => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [usuarioCargo, setUsuarioCargo] = useState<string>("Funcionario");
//   const [usuarioCod, setUsuarioCod] = useState<number>(1); 

//   return (
//     <AuthContext.Provider value={{ usuarioCargo, usuarioCod, setUsuarioCargo, setUsuarioCod }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  usuarioCargo: string;
  usuarioCod: number;
  setUsuarioCargo: (cargo: string) => void;
  setUsuarioCod: (cod: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ 
  children: ReactNode; 
  initialCargo?: string;  
  initialCod?: number;   
}> = ({ children, initialCargo = "Funcionário", initialCod = 1 }) => {  
  const [usuarioCargo, setUsuarioCargo] = useState<string>(initialCargo);
  const [usuarioCod, setUsuarioCod] = useState<number>(initialCod);

  return (
    <AuthContext.Provider value={{ usuarioCargo, usuarioCod, setUsuarioCargo, setUsuarioCod }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
