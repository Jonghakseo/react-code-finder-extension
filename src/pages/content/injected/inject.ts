type LogLevels = 'debug' | 'prod' | 'error';

try {
  ((logLevel: LogLevels) => {
    const Logger = {
      debug: (...args: unknown[]) => logLevel === 'debug' && console.log(...args),
      prod: (...args: unknown[]) => (logLevel === 'prod' || logLevel === 'debug') && console.log(...args),
      error: (...args: unknown[]) => console.error(...args),
    };
    const activeState = new Proxy(
      { current: false },
      {
        set: function (target, prop, value) {
          value ? setCustomCursor() : resetCursor();
          return Reflect.set(target, prop, value);
        },
      },
    );
    let ignorePathRegexp: string[] = [];
    let fiberRoot: Root | undefined;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const devToolsGlobalHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    let stateNodeFiberMap = new WeakMap<HTMLElement, Fiber>();
    let onCommitFiberRootTimout: ReturnType<typeof setTimeout> | null = null;

    invariant(devToolsGlobalHook, '__REACT_DEVTOOLS_GLOBAL_HOOK__ 를 찾을 수 없습니다.');

    // 기존 동작을 방해하지 않기 위한 Proxy
    devToolsGlobalHook.onCommitFiberRoot = new Proxy(devToolsGlobalHook.onCommitFiberRoot, {
      apply: function (target, thisArg, argumentsList) {
        fiberRoot = argumentsList.at(1);
        if (onCommitFiberRootTimout) {
          clearTimeout(onCommitFiberRootTimout);
        }
        onCommitFiberRootTimout = setTimeout(() => {
          Logger.prod('onCommitFiberRoot', fiberRoot);
          fiberRoot && findDebugSourceAndBindClickEvent(fiberRoot);
        }, 200);

        return Reflect.apply(target, thisArg, argumentsList);
      },
    });

    setInterval(() => {
      Logger.debug('초기 상태 체크');
      postMessageToOutside({ type: 'getCurrentState' });
    }, 1500);

    window.addEventListener('message', message => {
      const response = message.data;
      if (response.source !== 'react-code-finder-to-inject') {
        return;
      }
      switch (response.type) {
        case 'toggleOn':
          Logger.debug('toggleOn');
          activeState.current = true;
          break;
        case 'toggleOff':
          Logger.debug('toggleOff');
          activeState.current = false;
          break;
        case 'getCurrentState':
          Logger.debug('getCurrentState', response.data);
          activeState.current = response.data === 'ON';
          break;
        case 'setIgnorePaths':
          ignorePathRegexp = response.data.split(',');
          break;
      }
    });

    function findDebugSourceAndBindClickEvent(root: Root) {
      stateNodeFiberMap = new WeakMap();
      let nextUnitOfWork = root.current.child;
      while (nextUnitOfWork) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork, workInProgress => {
          if (workInProgress.stateNode && typeof workInProgress.type === 'string') {
            stateNodeFiberMap.set(workInProgress.stateNode, workInProgress);
            workInProgress.stateNode.addEventListener('click', onClick);
            workInProgress.stateNode.addEventListener('mouseenter', onMouseEnter);
          }
        });
      }
    }

    function onClick(event: MouseEvent) {
      Logger.debug(activeState.current);
      if (!activeState.current) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (!(event.currentTarget instanceof HTMLElement)) {
        throw Error('event.currentTarget 은 HTMLElement 인스턴스가 아닙니다.');
      }
      const fiber = stateNodeFiberMap.get(event.currentTarget);
      invariant(fiber, 'stateNode 와 맵핑된 fiber 가 존재하지 않습니다.');
      Logger.debug(fiber);
      const debugSource = findDebugSource(fiber);
      if (!debugSource) {
        Logger.debug('debugSource 가 존재하지 않습니다.');
        return;
      }
      postMessageToOutside({
        type: 'onClick',
        data: JSON.stringify(debugSource),
      });
    }

    function onMouseEnter(event: MouseEvent) {
      if (!activeState.current) {
        return;
      }
      if (!(event.currentTarget instanceof HTMLElement)) {
        throw Error('event.currentTarget 은 HTMLElement 인스턴스가 아닙니다.');
      }
      const fiber = stateNodeFiberMap.get(event.currentTarget);
      invariant(fiber, 'stateNode 와 맵핑된 fiber 가 존재하지 않습니다.');
      const debugSource = findDebugSource(fiber);
      if (!debugSource) {
        Logger.debug('debugSource 가 존재하지 않습니다.');
        return;
      }
      postMessageToOutside({
        type: 'onMouseEnter',
        data: JSON.stringify(debugSource),
      });
    }

    function isIgnorePath(fileName: string) {
      return ignorePathRegexp.some(ignoreRegexp => new RegExp(ignoreRegexp).test(fileName));
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

    function invariant<T>(target: T, message: string): asserts target {
      if (target !== undefined && target !== null) {
        return;
      }
      throw Error('[invariant error] ' + message);
    }

    const cursorStyleId = 'react-code-finder-cursor-style';

    function getCursorSVG() {
      return `
      <svg fill="none" height="24" viewBox="0 0 48 48" width="24" xmlns="http://www.w3.org/2000/svg"><g fill="#333"><path d="m18.7479 12.8156c-1.7407.0677-3.3126.6887-4.1535 1.5298-.3905.3906-1.0237.3906-1.4142.0001-.3906-.3904-.3907-1.0236-.0002-1.4142 1.2974-1.2976 3.4088-2.0332 5.4901-2.1142 2.0949-.0815 4.382.4921 5.9837 2.0941.3904.3905.3904 1.0237-.0002 1.4142-.3905.3905-1.0237.3904-1.4142-.0001-1.091-1.0913-2.7645-1.5769-4.4915-1.5097z"/><path clip-rule="evenodd" d="m28.9355 27.3841c1.912-2.2634 3.0645-5.1892 3.0645-8.3841 0-7.1797-5.8203-13-13-13s-13 5.8203-13 13 5.8203 13 13 13c3.1949 0 6.1207-1.1525 8.3841-3.0645l-.3841 2.2087 7.5137 7.5137 4.1442-4.1442-7.5137-7.5137zm-9.9355 1.6159c5.5228 0 10-4.4772 10-10s-4.4772-10-10-10-10 4.4772-10 10 4.4772 10 10 10z" fill-rule="evenodd"/><path d="m35.9279 40.0721 4.1442-4.1442 1.3557 1.3558c.7629.7629.7629 1.9998 0 2.7627l-1.3814 1.3814c-.7629.7629-1.9998.7629-2.7627 0z"/></g></svg>
    `;
    }

    function setCustomCursor() {
      const prevCursorCss = document.getElementById(cursorStyleId);
      prevCursorCss?.remove();

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

    const postMessageToOutside: PostMessageToOutside = ({ type, data }) => {
      window.postMessage({ source: 'react-code-finder-from-inject', type, data }, '*');
    };
  })('prod');
} catch (e) {
  console.error(e);
}
