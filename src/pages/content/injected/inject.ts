type LogLevels = 'debug' | 'prod' | 'error';

// Mock Type
type Fiber = {
  stateNode?: HTMLElement;
  type: unknown | string;
  child: Fiber | null;
  sibling: Fiber | null;
  return: Fiber | null;
  _debugSource: {
    fileName: string;
    lineNumber: number;
    columnNumber: number;
  } | null;
  _debugOwner: Fiber | null;
};

type Root = {
  current: Fiber;
};

type DebugSource = {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
};

((logLevel: LogLevels) => {
  const IGNORE_PATHS = ['components/common', 'frontend/packages'];

  const Logger = {
    debug: (...args: unknown[]) => {
      if (logLevel === 'debug') {
        console.log(...args);
      }
    },
    prod: (...args: unknown[]) => {
      if (logLevel === 'prod' || logLevel === 'debug') {
        console.log(...args);
      }
    },
    error: (...args: unknown[]) => {
      console.error(...args);
    },
  };

  const isActivated = { current: false };
  let isRedirected = false;
  let isRunning = false;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

  Logger.debug(devTools, isRunning);

  let nodeSourceMap = new WeakMap();

  let id: ReturnType<typeof setTimeout> = null;

  devTools.getFiberRoots(1).forEach((initialRoot: Root) => {
    setFindCodeEvent(initialRoot);
  });

  devTools.onCommitFiberRoot = (_, root) => {
    clearTimeout(id);
    id = setTimeout(() => {
      Logger.debug('onCommitFiberRoot', root);
      setFindCodeEvent(root);
    }, 300);
  };

  // let selectedElement: HTMLElement | null = null;

  function setFindCodeEvent(root: Root) {
    nodeSourceMap = new WeakMap();
    let nextUnitOfWork = root.current.child;
    while (nextUnitOfWork) {
      isRunning = true;
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork, workInProgress => {
        if (workInProgress.stateNode && typeof workInProgress.type === 'string') {
          if (nodeSourceMap.has(workInProgress.stateNode)) {
            return;
          }

          const debugSource = findDebugSource(workInProgress) as DebugSource | null;
          nodeSourceMap.set(workInProgress.stateNode, debugSource);

          workInProgress.stateNode.addEventListener('click', event => onClick(event, workInProgress));

          // if (debugSource?.fileName) {
          //   const filePaths = debugSource.fileName.split('/');
          //   const fileName = filePaths.at(-1);
          //   const folderName = filePaths.at(-2);
          //   workInProgress.stateNode.dataset.source = `${folderName}/${fileName}` + ':L' + debugSource.lineNumber;
          // }
          workInProgress.stateNode.addEventListener('mouseenter', () => {
            // selectedElement = workInProgress.stateNode;
            // Logger.debug(selectedElement, debugSource);
            Logger.debug(workInProgress, debugSource);
          });
        }
      });
    }
    Logger.prod('next dev code finder');
  }

  function onClick(event: MouseEvent, fiber: Fiber) {
    Logger.debug(fiber, isActivated.current);
    if (!isActivated.current) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const debugSource = nodeSourceMap.get(fiber.stateNode);
    Logger.prod(debugSource);
    debugSource && openIDEByNextLaunchEditor(debugSource);
  }

  window.postMessage({ source: 'next-dev-code-finder-from-inject', type: 'getCurrentState' }, '*');

  window.onmessage = message => {
    const response = message.data;
    if (response.source !== 'next-dev-code-finder-to-inject') {
      return;
    }
    switch (response.type) {
      case 'toggleOn':
        Logger.debug('toggleOn');
        isActivated.current = true;
        break;
      case 'toggleOff':
        Logger.debug('toggleOff');
        isActivated.current = false;
        break;
      case 'getCurrentState':
        Logger.debug('getCurrentState', response.data);
        isActivated.current = response.data === 'ON';
        break;
      default:
        break;
    }
  };

  function findDebugSource(fiber: Fiber): DebugSource | null {
    if (fiber._debugSource) {
      const fileName = fiber._debugSource.fileName;
      if (!IGNORE_PATHS.some(ignorePath => fileName.includes(ignorePath))) {
        return fiber._debugSource;
      }
    }
    if (fiber._debugOwner) {
      return findDebugSource(fiber._debugOwner);
    }
    return null;
  }

  function openIDEByNextLaunchEditor(debugSource: DebugSource) {
    if (isRedirected) {
      return;
    }
    isRedirected = true;
    Logger.debug('openIDE', debugSource);

    const params = new URLSearchParams();
    params.append('file', debugSource.fileName);
    params.append('lineNumber', String(debugSource.lineNumber));
    params.append('column', String(debugSource.columnNumber));
    const debugUrl = `http://localhost:3000/__nextjs_launch-editor?${params.toString()}`;
    Logger.prod(debugUrl);
    self.fetch(debugUrl).catch(error => {
      console.error('There was an issue opening this code in your editor.', error);
    });

    setTimeout(() => {
      isRedirected = false;
    }, 100);
  }

  function performUnitOfWork(workInProgress: Fiber, callback: (workInProgress: Fiber) => void) {
    // 1. 노드에 대한 작업을 수행
    callback(workInProgress);

    // 2. 자식 노드로 내려감
    if (workInProgress.child) {
      return workInProgress.child;
    }

    // 3. 자식 노드가 없으면 형제 노드로 이동
    let currentFiber = workInProgress;
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
})('prod');
