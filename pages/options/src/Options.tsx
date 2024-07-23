import React, { useEffect, useState } from 'react';
import '@src/Options.css';
import { Button, Flex, FormLabel, Grid, Heading, Input, Select, Switch, Textarea } from '@chakra-ui/react';
import { ignorePathsStorage, injectionConfigStorage, useStorage } from '@chrome-extension-boilerplate/shared';

const Options: React.FC = () => {
  const ignorePaths = useStorage(ignorePathsStorage);
  const injectConfig = useStorage(injectionConfigStorage);
  const [showCustomCursor, setShowCustomCursor] = useState<boolean>(injectConfig.showCustomCursor);
  const [showHoverComponentFrame, setShowHoverComponentFrame] = useState<boolean>(injectConfig.showHoverComponentFrame);
  const [componentNamePosition, setComponentNamePosition] = useState(
    injectConfig.componentNamePosition ?? 'bottom-left',
  );
  const [showHoverComponentName, setShowHoverComponentName] = useState<boolean>(injectConfig.showHoverComponentName);
  const [frameColor, setFrameColor] = useState<string>(injectConfig.frameColor);

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
    await injectionConfigStorage.set({
      showCustomCursor,
      showHoverComponentFrame,
      showHoverComponentName,
      frameColor,
      componentNamePosition,
    });
    alert('SAVED!');
  };
  return (
    <form onSubmit={onSubmit}>
      <Grid gap={4} p="40px" m="auto" alignItems="center" justifyContent="center">
        <Heading size="md">{`Enter your ignore file path as a regular expression\n(separate multiple values with '\\n')`}</Heading>
        <Textarea value={ignoreRegexp} onChange={onChange} />
        <Heading size="md">Injection Script Config</Heading>
        <Flex flexDirection="column" gap={2}>
          <FormLabel display="flex" justifyContent="space-between">
            Show Custom Cursor
            <Switch isChecked={showCustomCursor} onChange={() => setShowCustomCursor(!showCustomCursor)} />
          </FormLabel>
          <FormLabel display="flex" justifyContent="space-between">
            Show Hover Component Frame
            <Switch
              isChecked={showHoverComponentFrame}
              onChange={() => setShowHoverComponentFrame(!showHoverComponentFrame)}
            />
          </FormLabel>
          <FormLabel display="flex" justifyContent="space-between">
            Show Hover Component Name
            <Switch
              disabled={!showHoverComponentFrame}
              isChecked={showHoverComponentName}
              onChange={() => setShowHoverComponentName(!showHoverComponentName)}
            />
          </FormLabel>

          <FormLabel display="flex" justifyContent="space-between">
            Highlight Color
            <Input
              size="xs"
              width="70px"
              disabled={!showHoverComponentFrame}
              type="color"
              value={frameColor}
              onChange={event => setFrameColor(event.currentTarget.value)}
            />
          </FormLabel>
          <FormLabel display="flex" justifyContent="space-between">
            Component Name Position
            <Select
              size="sm"
              width="300px"
              disabled={!showHoverComponentFrame}
              value={componentNamePosition}
              onChange={event => setComponentNamePosition(event.target.value as typeof componentNamePosition)}>
              <option value="center">center</option>
              <option value="top-left">top-left</option>
              <option value="top-right">top-right</option>
              <option value="bottom-left">bottom-left</option>
              <option value="bottom-right">bottom-right</option>
            </Select>
          </FormLabel>
        </Flex>
        <Button type="submit">SAVE</Button>
      </Grid>
    </form>
  );
};

export default Options;
