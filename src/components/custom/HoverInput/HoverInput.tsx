import React, { useState } from 'react';
import { IconType } from 'react-icons';
import styles from './HoverInput.module.css'; // Adjust path to your CSS module

interface HoverInputProps {
  value: string;
  Icon: IconType;
  onChange: (newValue: string) => void;
}

const HoverInput: React.FC<HoverInputProps> = ({ value, Icon, onChange }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={styles.empresaInput}> {/* Match empresaInput container */}
      <label className={styles.inputLabel}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={styles.inputLabel} // Apply same input styling
          />
          {isHovered && <Icon style={{ position: 'absolute', right: '8px' }} />}
        </div>
      </label>
    </div>
  );
};

export default HoverInput;