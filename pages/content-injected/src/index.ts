import { DebugSource, Fiber, InjectionConfig, MessageFromInjected, Root } from '@chrome-extension-boilerplate/shared';

type ArgumentsType<T> = T extends (...args: infer U) => unknown ? U : never;

type LogLevels = 'debug' | 'prod' | 'error';

type Config = {
  injectionConfig: InjectionConfig;
};

const _logLevel: LogLevels = 'prod';

(async (logLevel: LogLevels) => {
  const Logger = {
    debug: (...args: unknown[]) => logLevel === 'debug' && console.log(...args),
    prod: (...args: unknown[]) => (logLevel === 'prod' || logLevel === 'debug') && console.log(...args),
    error: (...args: unknown[]) => console.error(...args),
  };

  Logger.debug('content-injected');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function waitForGlobalHook(): Promise<any> {
    return new Promise(resolve => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const devToolsGlobalHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (devToolsGlobalHook) {
        resolve(devToolsGlobalHook);
      } else {
        const id = setInterval(() => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const devToolsGlobalHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
          if (devToolsGlobalHook) {
            clearInterval(id);
            resolve(devToolsGlobalHook);
          }
        }, 250);
      }
    });
  }

  let config: Config | undefined;

  const activeState = new Proxy(
    { current: false },
    {
      set: function (target, prop, value) {
        if (config?.injectionConfig.showCustomCursor && value) {
          setCustomCursor();
        } else {
          resetCursor();
        }
        if (config?.injectionConfig.showHoverComponentFrame && value) {
          setHoverComponentFrameStyle();
        } else {
          resetHoverComponentFrameStyle();
        }
        return Reflect.set(target, prop, value);
      },
    },
  );

  window.addEventListener('resize', () => resetHoverComponentFrameStyle());
  window.addEventListener('blur', () => resetHoverComponentFrameStyle());

  let ignorePathRegexp: string[] = [];
  let fiberRoot: Root | undefined;
  const currentNode: { current: HTMLElement | undefined } = new Proxy(
    { current: undefined },
    {
      set: function (target, prop, value) {
        debouncedSetFocusBoxPosition(value);
        return Reflect.set(target, prop, value);
      },
    },
  );
  const devToolsGlobalHook = await waitForGlobalHook();
  Logger.debug('devToolsGlobalHook', devToolsGlobalHook);
  let stateNodeFiberMap = new WeakMap<HTMLElement, Fiber>();
  let onCommitFiberRootTimout: ReturnType<typeof setTimeout> | null = null;

  // 기존 동작을 방해하지 않기 위한 Proxy
  devToolsGlobalHook.onCommitFiberRoot = new Proxy(devToolsGlobalHook.onCommitFiberRoot, {
    apply: function (target, thisArg, argumentsList) {
      fiberRoot = argumentsList.at(1);
      if (onCommitFiberRootTimout) {
        clearTimeout(onCommitFiberRootTimout);
      }
      onCommitFiberRootTimout = setTimeout(() => {
        Logger.debug('onCommitFiberRoot', fiberRoot);
        fiberRoot && findDebugSourceAndBindEvent(fiberRoot);
      }, 200);

      return Reflect.apply(target, thisArg, argumentsList);
    },
  });

  setInterval(() => {
    Logger.debug('활성화 상태 체크');
    postMessage.getCurrentState();
  }, 1500);

  function findDebugSourceAndBindEvent(root: Root) {
    stateNodeFiberMap = new WeakMap();
    let nextUnitOfWork = root.current.child;
    while (nextUnitOfWork) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork, workInProgress => {
        const stateNode = workInProgress.stateNode;
        if (stateNode && typeof workInProgress.type === 'string') {
          stateNodeFiberMap.set(stateNode, workInProgress);
          stateNode.addEventListener('contextmenu', onRightClick);
          stateNode.addEventListener('mouseover', setTempDebugSource, true);
        }
      });
    }
  }

  function onRightClick(event: MouseEvent) {
    Logger.debug(activeState.current);
    if (!activeState.current) {
      return;
    }
    if (!(event.currentTarget instanceof HTMLElement)) {
      Logger.error('event.currentTarget is Not HTMLElement Instance.');
      return;
    }
    const fiber = stateNodeFiberMap.get(event.currentTarget) ?? findBindingFiber(event.currentTarget);
    Logger.debug(fiber);
    if (!fiber) {
      Logger.prod(fiber, 'Can not find stateNode mapped with fiber.');
      return;
    }
    const debugSources = findDebugSources(fiber);
    if (debugSources.length === 0) {
      Logger.debug('debugSource 가 존재하지 않습니다.');
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    currentNode.current = event.currentTarget;
    postMessage.setCurrentDebugSources(debugSources);
  }

  function setTempDebugSource(event: MouseEvent) {
    if (!activeState.current) {
      return;
    }
    if (!(event.currentTarget instanceof HTMLElement)) {
      Logger.error('event.currentTarget is Not HTMLElement Instance.');
      return;
    }
    const fiber = stateNodeFiberMap.get(event.currentTarget);
    Logger.debug(fiber);
    if (!fiber) {
      Logger.prod(fiber, 'Can not find stateNode mapped with fiber.');
      return;
    }
    const debugSource = findDebugSource(fiber);

    if (!debugSource) {
      Logger.debug('debugSource 가 존재하지 않습니다.');
      return;
    }
    currentNode.current = event.currentTarget;
    postMessage.setTempDebugSource(debugSource);
  }

  function isIgnorePath(fileName: string) {
    if (ignorePathRegexp.length === 0) {
      return false;
    }
    return ignorePathRegexp.filter(Boolean).some(ignoreRegexp => new RegExp(ignoreRegexp).test(fileName));
  }

  function findDebugSource(fiber: Fiber): DebugSource | null {
    if (fiber._debugSource) {
      if (!isIgnorePath(fiber._debugSource.fileName)) {
        return fiber._debugSource;
      }
    }
    if (fiber._debugOwner) {
      return findDebugSource(fiber._debugOwner);
    }
    return null;
  }
  function findDebugSources(fiber: Fiber): DebugSource[] {
    const debugSources: DebugSource[] = [];
    let currentFiber: Fiber | null = fiber;

    while (currentFiber) {
      if (currentFiber._debugSource) {
        if (!isIgnorePath(currentFiber._debugSource.fileName)) {
          debugSources.push(currentFiber._debugSource);
        }
      }
      currentFiber = currentFiber._debugOwner;
    }

    return debugSources;
  }

  function findBindingFiber(element: HTMLElement): Fiber | null {
    const reactFiberKey = Object.keys(element).find(key => {
      const lowerCaseKey = key.toLowerCase();
      return lowerCaseKey.startsWith('__react') && lowerCaseKey.endsWith('fiber');
    });
    if (!reactFiberKey) {
      return null;
    }
    // @ts-ignore
    return element[reactFiberKey] as Fiber;
  }

  /**
   * Utils
   */
  function performUnitOfWork(workInProgress: Fiber, callback: (workInProgress: Fiber) => void) {
    // 1. 노드에 대한 작업을 수행
    callback(workInProgress);

    // 2. 자식 노드로 내려감
    if (workInProgress.child) {
      return workInProgress.child;
    }

    // 3. 자식 노드가 없으면 형제 노드로 이동
    let currentFiber: Fiber | null = workInProgress;
    while (currentFiber) {
      if (currentFiber.sibling) {
        return currentFiber.sibling;
      }
      // 4. 형제 노드가 없으면 부모 노드로 올라가서 다시 형제 노드로 이동
      currentFiber = currentFiber.return;
    }

    // 5. 트리 순회 끝
    return null;
  }

  function getInvertBlackOrWhite(hex: string) {
    if (hex.indexOf('#') === 0) {
      hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
      return '#FFFFFF';
    }
    const r = parseInt(hex.slice(0, 2), 16),
      g = parseInt(hex.slice(2, 4), 16),
      b = parseInt(hex.slice(4, 6), 16);
    // https://stackoverflow.com/a/3943023/112731
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF';
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  function debounce<F extends Function>(callback: F, ms: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return function (args: ArgumentsType<F>) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        requestIdleCallback(() => callback(args));
      }, ms);
    };
  }

  /**
   * Cursor
   */
  const cursorStyleId = 'react-code-finder-cursor-style';

  function getCursorSVG() {
    return `
      <svg height="24px" width="24px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 509.82 509.82" xml:space="preserve">
        <g>
         <path style="fill:#ECF0F1;" d="M336.17,167.724c0,92.637-75.096,167.724-167.724,167.724c-92.637,0-167.724-75.087-167.724-167.724
          S75.809,0,168.446,0C261.074,0,336.17,75.087,336.17,167.724"/>
         <path style="fill:#556080;" d="M498.756,499.478L498.756,499.478c-13.789,13.789-36.149,13.789-49.929,0L337.679,386.9
          l49.938-49.938L498.756,449.54C512.545,463.329,512.545,485.689,498.756,499.478"/>
         <path style="fill:#8697CB;" d="M298.826,273.133c-7.424,9.181-15.793,17.54-24.973,24.973l76.315,76.306l24.973-24.964
          L298.826,273.133z"/>
         <path style="fill:#894B9D;" d="M256.662,310.181c13.091-8.121,24.947-17.982,35.31-29.281V132.411h-35.31V310.181z"/>
         <path style="fill:#E57E25;" d="M186.041,334.513c12.226-1.271,24.011-3.955,35.31-7.715V176.552h-35.31V334.513z"/>
         <path style="fill:#F0C419;" d="M115.42,326.754c11.299,3.769,23.084,6.453,35.31,7.742V220.691h-35.31V326.754z"/>
         <path style="fill:#C03A2B;" d="M44.8,280.768c10.355,11.326,22.219,21.195,35.31,29.343V114.756H44.8V280.768z"/>
        </g>
      </svg>
    `;
  }

  function setCustomCursor() {
    const prevCursorCss = document.getElementById(cursorStyleId);
    if (prevCursorCss) {
      return;
    }
    const blob = new Blob([getCursorSVG()], { type: 'image/svg+xml' });
    const URL = window.URL.createObjectURL(blob);
    const cssString = ` * { cursor: url(${URL}) ${2} ${2}, auto !important; }`;
    const style = document.createElement('style');
    style.id = cursorStyleId;
    style.innerHTML = cssString;
    document.head.appendChild(style);
  }

  function resetCursor() {
    const cursorCss = document.getElementById(cursorStyleId);
    cursorCss?.remove();
  }

  /**
   * Focus Style
   */

  const focusStyleId = 'react-code-finder-focus-style';
  const focusBoxId = 'react-code-finder-focus-box';
  function setHoverComponentFrameStyle() {
    const focusCss = (() => {
      const prevFocusCss = document.getElementById(focusStyleId);
      if (prevFocusCss) {
        return prevFocusCss;
      }
      const styleScript = document.createElement('style');
      styleScript.id = focusStyleId;
      document.head.appendChild(styleScript);
      return styleScript;
    })();
    focusCss.innerHTML = getBoxStyle();

    const focusBox = document.getElementById(focusBoxId);
    if (!focusBox) {
      const focusBox = document.createElement('div');
      focusBox.id = focusBoxId;
      document.body.appendChild(focusBox);
    }
  }

  function resetHoverComponentFrameStyle() {
    const focusCss = document.getElementById(focusStyleId);
    focusCss?.remove();
    const focusBox = document.getElementById(focusBoxId);
    focusBox?.remove();
  }

  const debouncedSetFocusBoxPosition = debounce(setFocusBoxPosition, 100);

  function setFocusBoxPosition(element: HTMLElement) {
    const { height, width, top, left } = element.getBoundingClientRect();
    const focusBox = document.getElementById(focusBoxId);
    if (!focusBox) {
      return;
    }
    const fiber = stateNodeFiberMap.get(element);
    if (!fiber) {
      return;
    }
    const debugSource = findDebugSource(fiber);
    if (!debugSource) {
      return;
    }
    focusBox.setAttribute('data-react-code-finder-source-file', debugSource.fileName?.split('/').at(-1) || '');
    focusBox.animate(
      [
        {
          top: `${top + window.scrollY - 1}px`,
          left: `${left + window.scrollX - 1}px`,
          height: `${height + 2}px`,
          width: `${width + 2}px`,
        },
      ],
      {
        fill: 'both',
      },
    );
  }

  function getBoxStyle() {
    const withName = !!config?.injectionConfig.showHoverComponentName;
    const frameColor = config?.injectionConfig.frameColor || '#000000';
    const namePosition = config?.injectionConfig.componentNamePosition || 'bottom-left';
    if (!withName) {
      return `
      #${focusBoxId} {
        position: absolute !important;
        z-index: 999999 !important;
        border: 1px solid ${frameColor} !important;
        background-color: ${frameColor}33 !important;
        border-radius: 2px !important;
        pointer-events: none !important;
      }
    `;
    }
    const frameBorder: Record<typeof namePosition, string> = {
      'bottom-left': 'border-radius: 2px 2px 2px 0 !important;',
      'bottom-right': 'border-radius: 2px 2px 0 2px !important;',
      'top-left': 'border-radius: 0 2px 2px 2px !important;',
      'top-right': 'border-radius: 2px 0 2px 2px !important;',
      center: 'border-radius: 2px !important;',
    };
    const componentNamePosition: Record<typeof namePosition, string> = {
      'bottom-left': 'top: 100%; left: -1px;',
      'bottom-right': 'top: 100%; right: -1px;',
      'top-left': 'bottom: 100%; left: -1px;',
      'top-right': 'bottom: 100%; right: -1px;',
      center: 'top: 50%; left: 50%; transform: translate(-50%, -50%);',
    };
    return `
      #${focusBoxId} {
        position: absolute !important;
        z-index: 999999 !important;
        border: 1px solid ${frameColor} !important;
        background-color: ${frameColor}33 !important;
        ${frameBorder[namePosition]}
        pointer-events: none !important;
      }
      #${focusBoxId}:after {
        position: absolute;
        z-index: 999999;
        content: attr(data-react-code-finder-source-file);
        ${componentNamePosition[namePosition]}
        font-size: 0.725rem;
        line-height: 1.2;
        padding: 0 0.5rem;
        background-color: ${frameColor};
        color: ${getInvertBlackOrWhite(frameColor)};
        pointer-events: none;
        border-radius: 0 0 2px 2px;
      }
    `;
  }

  /**
   * Message
   */
  const MESSAGE_SOURCE_FROM = 'react-code-finder-from-inject' as const;
  const MESSAGE_SOURCE_TO = 'react-code-finder-to-inject' as const;

  const postMessage = {
    setCurrentDebugSources: (debugSources: DebugSource[]) => {
      window.postMessage(
        { source: MESSAGE_SOURCE_FROM, type: 'setCurrentDebugSources', data: JSON.stringify(debugSources) },
        '*',
      );
    },
    getCurrentState: () => {
      window.postMessage({ source: MESSAGE_SOURCE_FROM, type: 'getCurrentState' }, '*');
    },
    setTempDebugSource: (debugSource: DebugSource) => {
      window.postMessage(
        { source: MESSAGE_SOURCE_FROM, type: 'setTempDebugSource', data: JSON.stringify(debugSource) },
        '*',
      );
    },
  } satisfies Record<MessageFromInjected['type'], unknown>;

  window.addEventListener('message', event => {
    const message = event.data;
    if (message.source !== MESSAGE_SOURCE_TO) {
      return;
    }
    switch (message.type) {
      case 'toggleOn':
        Logger.debug('toggleOn');
        activeState.current = true;
        break;
      case 'toggleOff':
        Logger.debug('toggleOff');
        activeState.current = false;
        break;
      case 'getCurrentState': {
        Logger.debug('getCurrentState', message.data);
        activeState.current = message.data === 'ON';
        break;
      }
      case 'setConfig': {
        Logger.debug('setConfig', message.data);
        config = JSON.parse(message.data);
        break;
      }
      case 'setIgnorePaths':
        ignorePathRegexp = message.data.split(',');
        break;
    }
  });
})(_logLevel);
