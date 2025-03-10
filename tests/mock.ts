import { jest, mock } from 'bun:test';

const allMocks = new Map<string, any>();

export function clearAllMocks() {
  for (const { clear } of allMocks.values()) {
    clear();
  }
}

export async function mockModule(
  name: string,
  renderMocks: () => Record<string, any>
): Promise<{ clear: () => void }> {
  if (allMocks.has(name)) {
    throw new Error(`${name} mocked twice.`);
  }

  const originals = { ...(await import(name)) };

  // Mock some exports from the module, keep the others intact.
  const mocks = renderMocks();
  const mockedExports = { ...originals, ...mocks };
  mock.module(name, () => mockedExports);

  allMocks.set(name, {
    clear: () => {
      mock.module(name, () => originals);
      allMocks.delete(name);
    },
  });
  return allMocks.get(name);
}

export function mockRouter() {
  return mockModule('next/router', () => ({
    useRouter: jest.fn(() => ({
      query: {},
      push: jest.fn(),
    })),
  }));
}
