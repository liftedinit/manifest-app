import { afterEach, beforeEach, describe, expect, jest, spyOn, test } from 'bun:test';

import imageLoader, { sanitizeImageUrl, validateImageUrl } from '../image-loader';

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
    // Restore original console implementations and reset mock state
    jest.restoreAllMocks();
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
        'http://example.ml/photo.png',
        'https://test.ga/pic.gif',
        'http://domain.cf/image.webp',
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
        'https://example.com/file.pif',
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
        'https://hack.test.net/image.webp',
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
      const maliciousUrl = 'https://example.ml/photo.png';
      imageLoader({ src: maliciousUrl, width: 400 });

      expect(mockConsoleError).toHaveBeenCalledWith(`Blocked malicious image URL: ${maliciousUrl}`);
    });

    test('should log warnings for invalid URL formats', () => {
      const invalidUrl = 'https://[invalid-host]';
      imageLoader({ src: invalidUrl, width: 400 });

      expect(mockConsoleWarn).toHaveBeenCalledWith(`Invalid URL format: ${invalidUrl}`);
    });
  });

  describe('NSFW Detection and Content Filtering', () => {
    describe('URL Pattern-Based NSFW Detection', () => {
      test('should block known adult domains', () => {
        const adultDomains = [
          'https://pornhub.com/image.jpg',
          'https://www.xvideos.com/thumb.png',
          'https://onlyfans.com/user/photo.jpeg',
          'https://chaturbate.com/screenshot.gif',
          'https://sub.redtube.com/preview.webp',
        ];

        adultDomains.forEach(url => {
          const result = imageLoader({ src: url, width: 400, quality: 75 });
          expect(result).toBe('/blocked-nsfw-placeholder.svg');
          expect(mockConsoleError).toHaveBeenCalledWith(`Blocked NSFW image URL: ${url}`);
        });
      });

      test('should block adult TLD patterns', () => {
        const adultTlds = [
          'https://example.xxx/image.jpg',
          'https://site.porn/photo.png',
          'https://test.sex/picture.jpeg',
          'https://domain.adult/image.webp',
        ];

        adultTlds.forEach(url => {
          const result = imageLoader({ src: url, width: 400, quality: 75 });
          expect(result).toBe('/blocked-nsfw-placeholder.svg');
        });
      });

      test('should integrate with obscenity package for profanity detection', () => {
        const profaneUrls = [
          'https://example.com/fuck-this.jpg',
          'https://site.com/shit-image.png',
        ];

        profaneUrls.forEach(url => {
          const result = imageLoader({ src: url, width: 400, quality: 75 });
          expect(result).toBe('/blocked-nsfw-placeholder.svg');
          expect(mockConsoleError).toHaveBeenCalledWith(`Blocked NSFW image URL: ${url}`);
        });

        // Test that clean URLs are not blocked
        const cleanUrl = 'https://imagehost.com/clean-photo.jpg';
        const result = imageLoader({ src: cleanUrl, width: 400, quality: 75 });
        expect(result).toContain('w=400');
        expect(result).toContain('q=75');
      });

      test('should block NSFW social media patterns', () => {
        const socialNsfwUrls = [
          'https://www.reddit.com/r/nsfw/image.jpg',
          'https://www.reddit.com/r/gonewild/photo.png',
          'https://www.reddit.com/r/realgirls/pic.jpeg',
          'https://twitter.com/user/nude-selfie.jpg',
          'https://instagram.com/model/nsfw-post.png',
        ];

        socialNsfwUrls.forEach(url => {
          const result = imageLoader({ src: url, width: 400, quality: 75 });
          expect(result).toBe('/blocked-nsfw-placeholder.svg');
        });
      });

      test('should allow generally safe URLs', () => {
        const safeUrls = [
          'https://imgur.com/gallery/cats.jpg',
          'https://images.unsplash.com/photo-nature.jpg',
          'https://company.com/team-photo.jpg',
          'https://museum.org/paintings.jpg',
        ];

        safeUrls.forEach(url => {
          const result = imageLoader({ src: url, width: 400, quality: 75 });
          expect(result).not.toBe('/blocked-image-placeholder.svg');
          // Note: may or may not be blocked by obscenity package depending on content
        });
      });

      test('should handle case insensitive domain detection', () => {
        const mixedCaseUrls = ['https://PORNHUB.COM/IMAGE.JPG', 'https://ONLYFANS.COM/photo.jpg'];

        mixedCaseUrls.forEach(url => {
          const result = imageLoader({ src: url, width: 400, quality: 75 });
          expect(result).toBe('/blocked-nsfw-placeholder.svg');
        });
      });
    });

    describe('Pattern-Based Validation Functions', () => {
      test('should validate safe images', () => {
        const result = validateImageUrl('https://example.com/safe-image.jpg');

        expect(result.isValid).toBe(true);
      });

      test('should detect NSFW images via patterns', () => {
        const result = validateImageUrl('https://pornhub.com/photo123.jpg');

        expect(result.isValid).toBe(false);
        expect(result.reason).toBe('NSFW content detected in URL');
      });

      test('should sanitize NSFW URLs to empty string', () => {
        const result = sanitizeImageUrl('https://onlyfans.com/photo456.jpg');

        expect(result).toBe('');
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          'Image excluded from form data: NSFW content detected in URL - https://onlyfans.com/photo456.jpg'
        );
      });

      test('should preserve safe URLs when sanitizing', () => {
        const result = sanitizeImageUrl('https://example.com/safe-image.jpg');

        expect(result).toBe('https://example.com/safe-image.jpg');
      });

      test('should handle empty URLs in sanitization', () => {
        const emptyResult = sanitizeImageUrl('');
        const nullResult = sanitizeImageUrl(null as any);
        const undefinedResult = sanitizeImageUrl(undefined as any);

        expect(emptyResult).toBe('');
        expect(nullResult).toBe('');
        expect(undefinedResult).toBe('');
      });

      test('should block URLs that fail pattern check', () => {
        const result = validateImageUrl('https://pornhub.com/image.jpg');

        expect(result.isValid).toBe(false);
        expect(result.reason).toBe('NSFW content detected in URL');
      });

      test('should validate safe URLs that pass pattern check', () => {
        const result = validateImageUrl('https://uploads.example.com/landscape.jpg');

        expect(result.isValid).toBe(true);
      });
    });
  });
});
