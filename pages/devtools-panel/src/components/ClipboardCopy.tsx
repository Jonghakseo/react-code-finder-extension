import { ReactNode, useRef, useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { CheckIcon, CopyIcon } from '@chakra-ui/icons';

type ClipboardCopyProps = {
  children: ReactNode;
};

export default function ClipboardCopy({ children }: ClipboardCopyProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  const copyText = async () => {
    if (!targetRef.current) {
      return;
    }
    /**
     * Clipboard API is not available in devtools panel.
     * So we use the old way to copy text. Thankfully, it's still working.
     */
    const range = document.createRange();
    range.selectNode(targetRef.current);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    document.execCommand('copy');
    window.getSelection()?.removeAllRanges();

    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Flex
      alignItems="center"
      gap={4}
      cursor="pointer"
      role="button"
      aria-roledescription="copy-button"
      onClick={copyText}>
      <div ref={targetRef}>{children}</div>
      {isCopied ? <CheckIcon /> : <CopyIcon color={'green'} />}
    </Flex>
  );
}
