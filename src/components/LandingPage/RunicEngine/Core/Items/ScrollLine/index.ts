export class ScrollLine {
  private _element: HTMLDivElement;
  private _circle: SVGCircleElement;
  private _pointer: SVGCircleElement; // New reference for the tip
  private _circumference: number;
  private _size: number;

  constructor(container?: HTMLElement) {

    // create svg circle for progress indicator
    this._size = 500; // adjust to be larger than PNG plane
    const radius = this._size / 2 - 4; // leave room for stroke
    this._circumference = 2 * Math.PI * radius;

    this._element = document.createElement('div');
    this._element.classList.add('scroll-circle');
    const parent = container ?? document.body;
    parent.append(this._element);

    this._element.innerHTML = `
      <svg width="${this._size}" height="${this._size}" viewBox="0 0 ${this._size} ${this._size}">
        <circle
          class="progress-line"
          cx="${this._size / 2}"
          cy="${this._size / 2}"
          r="${radius}"
          stroke="#134075"
          stroke-width="3"
          fill="none"
          stroke-dasharray="${this._circumference}"
          stroke-dashoffset="${this._circumference}"
          transform="rotate(-90 ${this._size / 2} ${this._size / 2})"
          style="transition: stroke-dashoffset 0.1s ease-out"
        />
        <circle
          class="pointer-tip"
          cx="${this._size / 2}"
          cy="${this._size / 2}"
          r="${radius}"
          stroke="white"
          stroke-width="6" 
          fill="none"
          stroke-dasharray="1 ${this._circumference}"
          stroke-linecap="round"
          transform="rotate(-90 ${this._size / 2} ${this._size / 2})"
          style="transition: transform 0.1s ease-out; transform-origin: center;"
        />
      </svg>
    `;

    this._circle = this._element.querySelector('.progress-line')!;
    this._pointer = this._element.querySelector('.pointer-tip')!;

    Object.assign(this._element.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      width: `${this._size}px`,
      height: `${this._size}px`,
      zIndex: '200',
    });
  }

  public render(progress: number) {
    // 1. Update the progress line length
    const offset = this._circumference * (1 - progress);
    this._circle.style.strokeDashoffset = `${offset}`;

    // 2. Rotate the pointer dot to the end of the progress line
    // We start at -90 degrees, so we add (progress * 360)
    const degrees = progress * 360 - 90;
    this._pointer.style.transform = `rotate(${degrees}deg)`;
  }

  /** Destroy the scene */
  public destroy() {
    this._element.remove();
  }
}