import { jest, mock } from 'bun:test';

const allMocks = new Map<string, MockedModule>();

export interface MockedModule {
  originals: Record<string, any>;
  mocks: Record<string, any>;
  clear(): void;
}

export function clearAllMocks() {
  for (const { clear } of allMocks.values()) {
    clear();
  }
}

/**
 * Mock a module and install a cleanup function to restore the original module.
 * @param name
 * @param renderMocks
 * @param force
 */
export function mockModule(
  name: string,
  renderMocks: () => Record<string, any>,
  force = false
): MockedModule {
  // Overload mocks if already existing.
  const maybeMockedModule = allMocks.get(name);
  if (maybeMockedModule) {
    if (force) {
      maybeMockedModule.mocks = { ...maybeMockedModule.mocks, ...renderMocks() };
    } else {
      throw new Error(
        `Module ${JSON.stringify(name)} is already mocked. Use force=true to overwrite.`
      );
    }
  } else {
    const mockedModule = {
      clear: () => {
        mock.module(name, () => mockedModule.originals);
        allMocks.delete(name);
      },
      originals: { ...require(name) },
      mocks: renderMocks(),
    };

    allMocks.set(name, mockedModule);
  }

  mock.module(name, () => {
    const m = allMocks.get(name);
    if (!m) {
      throw new Error('Invalid module state');
    }
    return { ...m.originals, ...m.mocks };
  });

  return allMocks.get(name)!;
}

/**
 * Convenience function to force mock a module.
 * @param name
 * @param renderMocks
 */
mockModule.force = (name: string, renderMocks: () => Record<string, any>) =>
  mockModule(name, renderMocks, true);

export function mockRouter(): MockedModule {
  return mockModule('next/router', () => ({
    useRouter: jest.fn().mockReturnValue({
      query: {},
      push: jest.fn(),
    }),
  }));
}
