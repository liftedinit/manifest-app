import { format as prettyFormat, plugins as prettyFormatPlugins } from 'pretty-format';

export function formatComponent(value: any): string {
  const formatted = prettyFormat(value, {
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

  // Normalize dynamic Headless UI IDs for consistent snapshots
  return formatted
    .replace(/headlessui-dialog-«r\w+»/g, 'headlessui-dialog-«normalized»')
    .replace(/headlessui-dialog-panel-«r\w+»/g, 'headlessui-dialog-panel-«normalized»')
    .replace(/headlessui-\w+-«r\w+»/g, match => {
      // Handle other headless UI components like headlessui-menu-«rXX», etc.
      const componentType = match.split('-')[1];
      return `headlessui-${componentType}-«normalized»`;
    });
}
