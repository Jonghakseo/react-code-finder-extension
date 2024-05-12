import { tempDebugSourceStorage, useStorage } from '@chrome-extension-boilerplate/shared';
import getSourceTitle from '@src/debugSource/getSourceTitle';
import { Text } from '@chakra-ui/react';

export default function FocusedSourceInfo() {
  const tempDebugSource = useStorage(tempDebugSourceStorage);
  return <Text>{getSourceTitle(tempDebugSource)}</Text>;
}
