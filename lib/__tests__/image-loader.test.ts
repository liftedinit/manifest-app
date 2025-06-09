import { afterEach, beforeEach, describe, expect, jest, spyOn, test } from 'bun:test';

import imageLoader from '../image-loader';

// Mock console methods to test warning/error logging
const mockConsoleWarn = jest.fn();
const mockConsoleError = jest.fn();

describe('Image Loader', () => {
  beforeEach(() => {
    // Mock console methods
    spyOn(console, 'warn').mockImplementation(mockConsoleWarn);
    spyOn(console, 'error').mockImplementation(mockConsoleError);
  });

  afterEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    mockConsoleWarn.mockClear();
    mockConsoleError.mockClear();
  });

  describe('Valid URLs', () => {
    test('should handle valid HTTP URLs with optimization parameters', () => {
      const result = imageLoader({
        src: 'https://example.com/image.jpg',
        width: 800,
        quality: 90,
      });

      expect(result).toContain('w=800');
      expect(result).toContain('q=90');
      expect(result).toContain('https://example.com/image.jpg');
    });

    test('should handle valid HTTPS URLs', () => {
      const result = (imageLoader as any)({
        src: 'https://cdn.example.com/photo.png',
        width: 400,
      });

      expect(result).toContain('w=400');
      expect(result).toContain('q=75'); // default quality
    });

    test('should handle local paths without modification', () => {
      const localPath = '/images/local-image.jpg';
      const result = imageLoader({
        src: localPath,
        width: 600,
      });

      expect(result).toBe(localPath);
    });

    test('should handle relative paths', () => {
      const relativePath = '/assets/icon.svg';
      const result = imageLoader({
        src: relativePath,
        width: 100,
      });

      expect(result).toBe(relativePath);
    });
  });

  describe('Malicious URL Detection', () => {
    test('should block URLs with suspicious TLDs', () => {
      const maliciousUrls = [
        'https://suspicious.tk/image.jpg',
        'http://malware.ml/photo.png',
        'https://scam.ga/pic.gif',
        'http://bad.cf/image.webp',
      ];

      maliciousUrls.forEach(url => {
        const result = imageLoader({ src: url, width: 400 });
        expect(result).toBe('/blocked-image-placeholder.svg');
        expect(mockConsoleError).toHaveBeenCalledWith(`Blocked malicious image URL: ${url}`);
      });
    });

    test('should block URLs with redirect parameters', () => {
      const redirectUrls = [
        'https://example.com/image.jpg?redirect=https://malicious.com',
        'https://site.com/pic.png?goto=http://bad.com',
        'https://domain.com/photo.gif?r=https://evil.com',
      ];

      redirectUrls.forEach(url => {
        const result = imageLoader({ src: url, width: 400 });
        expect(result).toBe('/blocked-image-placeholder.svg');
      });
    });

    test('should block URLs with suspicious file extensions', () => {
      const suspiciousUrls = [
        '/images/malware.exe',
        '/files/script.bat',
        '/assets/virus.jar',
        'https://example.com/app.app',
      ];

      suspiciousUrls.forEach(url => {
        const result = imageLoader({ src: url, width: 400 });
        expect(result).toBe('/blocked-image-placeholder.svg');
      });
    });

    test('should block non-HTTP/HTTPS protocols', () => {
      const protocolUrls = [
        'ftp://example.com/image.jpg',
        'file:///local/image.png',
        'javascript:alert("xss")',
        'data:image/png;base64,abc123',
        'not-a-valid-url',
      ];

      protocolUrls.forEach(url => {
        const result = imageLoader({ src: url, width: 400 });
        expect(result).toBe('/blocked-image-placeholder.svg');
      });
    });

    test('should block malicious subdomains', () => {
      const maliciousSubdomains = [
        'https://malware.example.com/image.jpg',
        'http://virus.site.com/photo.png',
        'https://phishing.domain.org/pic.gif',
        'https://scam.test.net/image.webp',
      ];

      maliciousSubdomains.forEach(url => {
        const result = imageLoader({ src: url, width: 400 });
        expect(result).toBe('/blocked-image-placeholder.svg');
      });
    });
  });

  describe('Input Validation', () => {
    test('should handle null/undefined sources', () => {
      const nullResult = imageLoader({ src: null as any, width: 400 });
      const undefinedResult = imageLoader({ src: undefined as any, width: 400 });

      expect(nullResult).toBe('/blocked-image-placeholder.svg');
      expect(undefinedResult).toBe('/blocked-image-placeholder.svg');
    });

    test('should handle empty string sources', () => {
      const result = imageLoader({ src: '', width: 400 });
      expect(result).toBe('/blocked-image-placeholder.svg');
    });

    test('should handle non-string sources', () => {
      const numericResult = imageLoader({ src: 123 as any, width: 400 });
      const objectResult = imageLoader({ src: {} as any, width: 400 });

      expect(numericResult).toBe('/blocked-image-placeholder.svg');
      expect(objectResult).toBe('/blocked-image-placeholder.svg');
    });

    test('should block URLs that are too short', () => {
      const shortUrls = ['http://', 'a', '12345'];

      shortUrls.forEach(url => {
        const result = imageLoader({ src: url, width: 400 });
        expect(result).toBe('/blocked-image-placeholder.svg');
      });
    });

    test('should block URLs that are too long', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(4100);
      const result = imageLoader({ src: longUrl, width: 400 });
      expect(result).toBe('/blocked-image-placeholder.svg');
    });

    test('should handle malformed URLs', () => {
      const malformedUrls = ['http://.example.com', 'https://example..com'];

      malformedUrls.forEach(url => {
        const result = imageLoader({ src: url, width: 400 });
        expect(result).toBe('/blocked-image-placeholder.svg');
      });
    });
  });

  describe('Parameter Handling', () => {
    test('should use default quality when not provided', () => {
      const result = imageLoader({
        src: 'https://example.com/image.jpg',
        width: 800,
      });

      expect(result).toContain('q=75');
    });

    test('should handle custom quality parameter', () => {
      const result = imageLoader({
        src: 'https://example.com/image.jpg',
        width: 800,
        quality: 95,
      });

      expect(result).toContain('q=95');
    });

    test('should preserve existing query parameters', () => {
      const result = imageLoader({
        src: 'https://example.com/image.jpg?existing=param',
        width: 600,
        quality: 80,
      });

      expect(result).toContain('existing=param');
      expect(result).toContain('w=600');
      expect(result).toContain('q=80');
    });
  });

  describe('Console Logging', () => {
    test('should log warnings for blocked URLs', () => {
      imageLoader({ src: 'https://malware.tk/image.jpg', width: 400 });

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Blocked potentially malicious URL')
      );
    });

    test('should log errors for blocked images', () => {
      const maliciousUrl = 'https://scam.ml/photo.png';
      imageLoader({ src: maliciousUrl, width: 400 });

      expect(mockConsoleError).toHaveBeenCalledWith(`Blocked malicious image URL: ${maliciousUrl}`);
    });

    test('should log warnings for invalid URL formats', () => {
      const invalidUrl = 'https://[invalid-host]';
      imageLoader({ src: invalidUrl, width: 400 });

      expect(mockConsoleWarn).toHaveBeenCalledWith(`Invalid URL format: ${invalidUrl}`);
    });
  });
});
