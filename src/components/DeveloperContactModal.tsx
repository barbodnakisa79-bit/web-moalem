import React from 'react';
import { DeveloperContactCard } from './DeveloperContactCard';

interface DeveloperContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperContactModal: React.FC<DeveloperContactModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-md w-full">
        <DeveloperContactCard onClose={onClose} showCloseButton={true} />
      </div>
    </div>
  );
};
