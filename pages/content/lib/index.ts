import loadInjectedScript from '@lib/loadInjectedScript';
import { init } from '@lib/init';

loadInjectedScript().then(() => {
  init();
});
