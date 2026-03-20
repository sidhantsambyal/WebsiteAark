import { loadImage, times, vevet } from '@anton.bobrov/vevet-init';
import { WebglManager } from './webgl/Manager';
import { Items } from './Items';

const managerContainer = document.getElementById('scene') as HTMLElement;

const manager = new WebglManager(managerContainer, {
  cameraProps: { fov: 50, perspective: 800 },
  rendererProps: {
    dpr: vevet.viewport.lowerDesktopDpr,
    antialias: false,
  },
});

manager.play();

const imageSrcs = times((index) => `${index}.png`, 30); // 24
// const imageSrcs = [
//   'aark-logo.png',
//   'Hardware.png',
//   'Platform.png',
//   'Product.png',
// ];
let loadCount = 0;

function handleLoaded() {
  loadCount += 1;

  manager.container.setAttribute(
    'data-is-loaded',
    `${loadCount / (imageSrcs.length + 1)}`,
  );
}

const loaders = imageSrcs.map((image) => loadImage(image));
loaders.forEach((loader) => {
  loader.then(() => handleLoaded()).catch(() => {});
});

Promise.all(loaders)
  .then((images) => {
    // Create Items instance (intentional side effect for initialization)
    new Items({ manager, images });

    handleLoaded();
  })
  .catch(() => {});
