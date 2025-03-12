import { format as prettyFormat, plugins as prettyFormatPlugins } from 'pretty-format';

export function formatComponent(value: any): string {
  return prettyFormat(value, {
    escapeRegex: true,
    indent: 2,
    plugins: [
      prettyFormatPlugins.ReactTestComponent,
      prettyFormatPlugins.ReactElement,
      prettyFormatPlugins.DOMElement,
      prettyFormatPlugins.DOMCollection,
      prettyFormatPlugins.Immutable,
      prettyFormatPlugins.AsymmetricMatcher,
    ],
    printFunctionName: false,
  });
}
