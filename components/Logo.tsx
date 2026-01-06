import React from 'react';
import { MINIMALIST_LOGO_URL } from '../constants';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 64,
    xl: 120
  };

  const s = sizeMap[size];

  // Design baseado em "VQC-LOGO MINIMALISTA.PNG":
  // Retornamos a imagem do Backblaze para velocidade e fidelidade de marca,
  // mantendo o SVG como fallback se necessário.
  return (
    <img
      src={MINIMALIST_LOGO_URL}
      width={s}
      height={s}
      className={`object-contain ${className}`}
      alt="Logo Academia VQC"
    />
  );
};
