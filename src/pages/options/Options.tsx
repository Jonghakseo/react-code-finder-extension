import React, { useEffect, useState } from 'react';
import '@pages/options/Options.css';
import { ignorePathsStorage } from '@src/shared/storages/ignorePathsStorage';
import useStorage from '@src/shared/hooks/useStorage';

const Options: React.FC = () => {
  const ignorePaths = useStorage(ignorePathsStorage);
  const [ignoreRegexp, setIgnoreRegexp] = useState<string>('');

  useEffect(() => {
    setIgnoreRegexp(ignorePaths.join('\n'));
  }, [ignorePaths]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.currentTarget.value;
    setIgnoreRegexp(value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const updatedPaths = ignoreRegexp.split('\n').map(v => v.trim());
    await ignorePathsStorage.set(updatedPaths);
    alert('SAVED!\n' + updatedPaths.join('\n'));
  };

  return (
    <form className="container" onSubmit={onSubmit}>
      <label>
        <span
          style={{
            whiteSpace: 'pre-wrap',
          }}>{`Enter your ignore file path as a regular expression\n(separate multiple values with '\\n')`}</span>
        <textarea
          style={{
            marginTop: '12px',
            width: '400px',
            height: '200px',
          }}
          value={ignoreRegexp}
          onChange={onChange}
        />
      </label>
      <button>SAVE</button>
    </form>
  );
};

export default Options;
