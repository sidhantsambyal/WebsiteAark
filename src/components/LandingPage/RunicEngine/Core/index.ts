import '../styles/index.scss';
import { Preloader } from './Preloader';
import './initScene';

const preloaderContainer = document.getElementById('preloader') as HTMLElement;

new Preloader({
  container: preloaderContainer,
});
