import {
  NCallbacks,
  SlideProgress,
  clampScope,
} from '@anton.bobrov/vevet-init';
import { Group } from 'three';
import { TProps } from './types';
import { Item } from './Item';
import { ScrollLine } from './ScrollLine';
import { MouseMove } from './MouseMove';

export class Items {
  private _callbacks: NCallbacks.IAddedCallback[] = [];

  private _scene: Group;

  private _items: Item[] = [];

  private _slideProgress: SlideProgress;

  private _scrollLine: ScrollLine;

  private _mouseMove: MouseMove;

  /**
   * When true, GSAP/ScrollTrigger drives the `SlideProgress` value.
   * We disable SlideProgress's internal wheel/drag handlers to avoid drift.
   */
  private _scrollSyncEnabled = false;

  private get length() {
    return this._props.images.length;
  }

  constructor(private _props: TProps) {
    const { manager, images } = _props;

    // create scene
    this._scene = new Group();
    manager.scene.add(this._scene);

    // create items
    this._items = images.map(
      (image, index) =>
        new Item({ manager, image, parent: this._scene, index }),
    );

    // create slide progress instance
    this._slideProgress = new SlideProgress({
      container: manager.container,
      min: 0,
      max: this.length - 1,
      step: 1,
      friction: 0.1,
      stickyEndDuration: null,
      wheelSpeed: 0.25,
      dragSpeed: 1,
      stepThreshold: 0.1,
      // ease: 0.01,
    });

    // create scroll indicator (append to manager container so it sits above canvas)
    this._scrollLine = new ScrollLine(manager.container);

    // add mousemove
    this._mouseMove = new MouseMove();

    // render
    this._render();
    this._callbacks.push(manager.callbacks.add('render', () => this._render()));
  }

  /**
   * Enable/disable external scroll driving (GSAP pin scroll).
   * While enabled we turn off SlideProgress internal wheel/drag to ensure 1:1 sync.
   */
  public setScrollSyncEnabled(enabled: boolean) {
    this._scrollSyncEnabled = enabled;

    const sp = this._slideProgress as unknown as {
      changeProps?: (props: { hasWheel?: boolean; hasDrag?: boolean }) => void;
      // internal fields, used only for best-effort stopping
      _animationFrame?: { pause?: () => void };
      _timelineTo?: { destroy?: () => void };
    };

    sp._timelineTo?.destroy?.();
    if (sp._timelineTo) sp._timelineTo = undefined;
    sp._animationFrame?.pause?.();

    // Disable/enable internal input handlers
    sp.changeProps?.({
      hasWheel: enabled ? false : true,
      hasDrag: enabled ? false : true,
    });
  }

  /** Force SlideProgress to the given value immediately (no easing). */
  public syncProgress(progress: number) {
    // Expected range is [0, length-1]; clamp defensively.
    const max = this.length - 1;
    const clamped = Math.max(0, Math.min(max, progress));

    const sp = this._slideProgress as unknown as {
      _progressLerp?: { current: number; target: number };
      _timelineTo?: { destroy?: () => void };
      _animationFrame?: { pause?: () => void };
    };

    // Ensure internal animation doesn't “fight” the external value.
    sp._timelineTo?.destroy?.();
    if (sp._timelineTo) sp._timelineTo = undefined;
    sp._animationFrame?.pause?.();

    if (sp._progressLerp) {
      sp._progressLerp.current = clamped;
      sp._progressLerp.target = clamped;
    }
  }

  /** Render scene */
  private _render() {
    this._renderMouse();
    this._renderItems();
    this._renderScrollLine();
  }

  /** Render moue */
  private _renderMouse() {
    const { easeMultiplier } = this._props.manager;

    this._mouseMove.render(easeMultiplier * 0.1);
  }

  /** Render items */
  private _renderItems() {
    const { progress: globalProgress } = this._slideProgress;
    const { _scene: scene, _mouseMove: mouse } = this;

    // render each item
    this._items.forEach((item, index) => {
      const inScope = [index - 0.9, index];
      const outScope = [index, index + 0.3];

      const inProgress = clampScope(globalProgress, inScope);
      const outProgress = clampScope(globalProgress, outScope);

      item.progress = { in: inProgress, out: outProgress };

      item.render();
    });

    // render group
    scene.position.x = mouse.x * -25;
    scene.position.y = mouse.y * 25;
    scene.rotation.x = mouse.y * Math.PI * 0.1;
    scene.rotation.y = mouse.x * Math.PI * 0.2;
  }

  /** Render scroll line */
  private _renderScrollLine() {
    // `length - 1` maps SlideProgress progress to [0..1] for the indicator.
    const denom = Math.max(1, this.length - 1);
    this._scrollLine.render(this._slideProgress.progress / denom);
  }

  /** Get current carousel scroll progress (0 to length-1) */
  public getProgress(): number {
    return this._slideProgress.progress;
  }

  /** Get max carousel position */
  public getMaxProgress(): number {
    return this.length - 1;
  }

  /** Destroy the scene */
  public destroy() {
    this._callbacks.forEach((callback) => callback.remove());
    this._props.manager.scene.remove(this._scene);

    this._items.forEach((item) => item.destroy());

    this._slideProgress.destroy();
    this._scrollLine.destroy();
    this._mouseMove.destroy();
  }
}
