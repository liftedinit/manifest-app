import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';

type MessageType = {
  '@type': string;
  [key: string]: any;
};

export function messageSyntax(fieldsToShow: string[], message: MessageType, theme: string) {
  const prettyPrintJSON = (obj: Record<string, any>): string => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <SyntaxHighlighter
      language="json"
      style={theme === 'dark' ? oneDark : oneLight}
      customStyle={{
        backgroundColor: 'transparent',
        padding: '1rem',
        borderRadius: '0.5rem',
      }}
    >
      {prettyPrintJSON(
        fieldsToShow.reduce((acc: Record<string, any>, field: string) => {
          acc[field] = message[field];
          return acc;
        }, {})
      )}
    </SyntaxHighlighter>
  );
}
