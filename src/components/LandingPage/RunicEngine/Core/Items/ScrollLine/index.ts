export class ScrollLine {
  private _element: HTMLDivElement;
  private _circle: SVGCircleElement;
  private _circumference: number;

  constructor(container?: HTMLElement) {
    this._element = document.createElement('div');
    this._element.classList.add('scroll-circle');
    const parent = container ?? document.body;
    parent.append(this._element);

    // create svg circle for progress indicator
    const size = 600; // adjust to be larger than PNG plane
    const radius = size / 2 - 4; // leave room for stroke
    this._circumference = 2 * Math.PI * radius;

    this._element.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          stroke="#134075"
          stroke-width="3"
          fill="none"
          stroke-dasharray="${this._circumference}"
          stroke-dashoffset="${this._circumference}"
          transform="rotate(-90 ${size / 2} ${size / 2})"
        />
      </svg>
    `;

    this._circle = this._element.querySelector('circle')!;
    // basic styles via JS to avoid extra CSS file
    Object.assign(this._element.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      width: `${size}px`,
      height: `${size}px`,
      zIndex: '200',
    });
  }

  public render(progress: number) {
    const offset = this._circumference * (1 - progress);
    this._circle.style.strokeDashoffset = `${offset}`;
  }

  /** Destroy the scene */
  public destroy() {
    this._element.remove();
  }
}
