import React from 'react';

interface SkipButtonProps {
  onSkip?: () => void;
}

const SkipButton: React.FC<SkipButtonProps> = ({ onSkip }) => {
  return (
    <div className="skip-container">
      <button className="Btn" onClick={onSkip}>
        <span className="text">Skip</span>
      </button>

      <style>{`
                .skip-container {
                  position: fixed;
                  bottom: 20px;
                  right: 20px;
                  z-index: 99;
                }

                .Btn {
                  position: relative;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 75px;
                  height: 28px;
                  background-color: #0d2a54;
                  color: #ffffff;
                  border: 1px solid #9db1cc;
                  border-radius: 20px;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  overflow: hidden;
                }

                .text {
                  font-family: 'Raleway', sans-serif;
                  font-size: 12px;
                  font-weight: 500;
                  transition: all 0.3s ease;
                }

                .Btn:hover {
                  background-color: #163a6e;
                  border-color: #ffffff;
                }

                .Btn:active {
                  transform: scale(0.95);
                }
            `}</style>
    </div>
  );
};

export default SkipButton;