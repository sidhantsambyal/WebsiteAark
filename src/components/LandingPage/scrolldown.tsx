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
          .sd-mini-container {
            position: ${isFixed ? 'fixed' : 'absolute'};
            bottom: 15px; /* Added bottom back so it's visible on screen */
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 100;
            pointer-events: auto; 
            cursor: pointer;
          }

          .sd-tooltip {
            position: relative;
            background: ${color};
            color: ${bubbleTextColor};
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 11px;
            font-weight: 600;
            padding: 5px 12px;
            border-radius: 6px;
            margin-bottom: 10px;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .sd-tooltip::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid ${color};
          }

          .sd-mini-container:hover .sd-tooltip {
            opacity: 1;
            transform: translateY(0);
          }

          /* Fixed: Added width and height */
          .sd-mini-mouse {
            width: 16px;
            height: 26px;
            border: 1.5px solid ${color};
            border-radius: 10px;
            position: relative;
            opacity: 0.7;
            transition: opacity 0.3s;
          }

          .sd-mini-container:hover .sd-mini-mouse {
            opacity: 1;
          }

          /* Fixed: Added top and height */
          .sd-mini-mouse::before {
            content: "";
            position: absolute;
            top: 5px;
            left: 50%;
            width: 2px;
            height: 4px;
            margin-left: -1px;
            background-color: ${color};
            border-radius: 2px;
            animation: sd-mini-wheel 1.5s infinite;
          }

          @keyframes sd-mini-wheel {
            0% { opacity: 0; transform: translateY(0); }
            30% { opacity: 1; }
            80% { opacity: 0; transform: translateY(8px); }
            100% { opacity: 0; }
          }

          .sd-mini-chevrons {
            margin-top: 4px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          /* Fixed: Added width and height */
          .sd-mini-chevron {
            width: 5px;
            height: 5px;
            border-right: 1.5px solid ${color};
            border-bottom: 1.5px solid ${color};
            transform: rotate(45deg);
            opacity: 0.4;
          }
        `}
      </style>

      <div className="sd-mini-container">
        <div className="sd-tooltip">
          {tooltipText}
        </div>
        <div className="sd-mini-mouse"></div>
        <div className="sd-mini-chevrons">
          <div className="sd-mini-chevron"></div>
        </div>
      </div>
    </>
  );
};

export default ScrollDown;