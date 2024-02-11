import React, { useEffect, useState } from 'react';
import '@pages/options/Options.css';
import { ignorePathsStorage } from '@src/shared/storages/ignorePathsStorage';
import useStorage from '@src/shared/hooks/useStorage';
import { Button, Grid, Heading, Textarea } from '@chakra-ui/react';

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
    <form onSubmit={onSubmit}>
      <Grid gap={4} p="40px" m="auto" alignItems="center" justifyContent="center">
        <Heading size="md">{`Enter your ignore file path as a regular expression\n(separate multiple values with '\\n')`}</Heading>
        <Textarea value={ignoreRegexp} onChange={onChange} />
        <Button type="submit">SAVE</Button>
      </Grid>
    </form>
  );
};

export default Options;
