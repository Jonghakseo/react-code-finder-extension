import { useSyncExternalStore } from 'react';
import { BaseStorage } from '../storages';

type WrappedPromise = ReturnType<typeof wrapPromise>;
const storageMap: Map<BaseStorage<unknown>, WrappedPromise> = new Map();

export default function useStorage<
  Storage extends BaseStorage<Data>,
  Data = Storage extends BaseStorage<infer Data> ? Data : unknown,
>(storage: Storage) {
  const _data = useSyncExternalStore<Data | null>(storage.subscribe, storage.getSnapshot);

  // eslint-disable-next-line
  // @ts-ignore
  if (!storageMap.has(storage)) {
    // eslint-disable-next-line
    // @ts-ignore
    storageMap.set(storage, wrapPromise(storage.get()));
  }
  if (_data !== null) {
    // eslint-disable-next-line
    // @ts-ignore
    storageMap.set(storage, { read: () => _data });
  }
  // eslint-disable-next-line
  // @ts-ignore
  return _data ?? (storageMap.get(storage)!.read() as Data);
}

function wrapPromise<R>(promise: Promise<R>) {
  let status = 'pending';
  let result: R;
  const suspender = promise.then(
    r => {
      status = 'success';
      result = r;
    },
    e => {
      status = 'error';
      result = e;
    },
  );

  return {
    // eslint-disable-next-line
    // @ts-ignore
    read() {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'error') {
        throw result;
      } else if (status === 'success') {
        return result;
      }
    },
  };
}
