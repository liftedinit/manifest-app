import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }

  interface Window {
    keplr?: any;
    ethereum?: any;
    leap?: any;
  }
}
