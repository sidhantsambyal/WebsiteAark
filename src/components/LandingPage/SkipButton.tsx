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
          /* Keeping your exact original size */
          width: 75px;
          height: 28px;
          background: transparent;
          color: #ffffff;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 1;
        }

        /* The Gradient Border (Default) */
        .Btn::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 20px; 
          padding: 1.5px; /* Border thickness */
          background: linear-gradient(to right, #8a4fff, #2d82e4); 
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          transition: all 0.3s ease;
        }

        .text {
          font-family: 'Raleway', sans-serif;
          font-size: 12px;
          font-weight: 500;
          position: relative;
          z-index: 2;
        }

        /* Hover State: Solid Gradient Background */
        .Btn:hover {
          background: linear-gradient(to right, #8a4fff, #2d82e4);
          color: #ffffff;
        }

        /* Hide the border line when the background becomes solid on hover */
        .Btn:hover::before {
          opacity: 0;
        }

        .Btn:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
};

export default SkipButton;