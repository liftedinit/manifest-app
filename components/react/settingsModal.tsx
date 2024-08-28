// components/SettingsModal.tsx

import React from "react";
import { useAdvancedMode } from "@/contexts";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { isAdvancedMode, toggleAdvancedMode } = useAdvancedMode();

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Settings</h3>
        <div className="py-4">
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text text-md">Advanced Mode</span>
              <input
                type="checkbox"
                className="toggle"
                checked={isAdvancedMode}
                onChange={toggleAdvancedMode}
              />
            </label>
          </div>
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
