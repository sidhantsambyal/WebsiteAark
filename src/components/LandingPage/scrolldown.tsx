import React from 'react';

interface ScrollDownProps {
  color?: string;
  isFixed?: boolean;
  tooltipText?: string;
}

const ScrollDown: React.FC<ScrollDownProps> = ({
  color = 'white',
  isFixed = true,
  tooltipText = 'Scroll Down'
}) => {
  const bubbleTextColor = color === 'white' ? '#1a1a1a' : 'white';

  return (
    <>
      <style>
        {`
          .sd-container {
            position: ${isFixed ? 'fixed' : 'absolute'};
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 100;
            cursor: pointer;
          }

          .sd-tooltip {
            position: relative;
            background: ${color};
            color: ${bubbleTextColor};
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 12px;
            font-weight: 600;
            padding: 6px 14px;
            border-radius: 7px;
            margin-bottom: 10px;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            opacity: 0;
            transform: translateY(8px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .sd-tooltip::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid ${color};
          }

          .sd-container:hover .sd-tooltip {
            opacity: 1;
            transform: translateY(0);
          }

          /* Balanced Size: 22px x 36px */
          .sd-mouse {
            width: 22px; 
            height: 36px;
            border: 1.8px solid ${color};
            border-radius: 12px;
            position: relative;
            opacity: 0.75;
            transition: opacity 0.3s;
          }

          .sd-container:hover .sd-mouse {
            opacity: 1;
          }

          .sd-mouse::before {
            content: "";
            position: absolute;
            top: 6px;
            left: 50%;
            width: 2.5px;
            height: 5px;
            margin-left: -1.25px;
            background-color: ${color};
            border-radius: 2px;
            animation: sd-wheel-anim 1.6s infinite;
          }

          @keyframes sd-wheel-anim {
            0% { opacity: 0; transform: translateY(0); }
            20% { opacity: 1; }
            70% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 0; }
          }
        `}
      </style>

      <div className="sd-container">
        <div className="sd-tooltip">
          {tooltipText}
        </div>
        <div className="sd-mouse"></div>
      </div>
    </>
  );
};

export default ScrollDown;