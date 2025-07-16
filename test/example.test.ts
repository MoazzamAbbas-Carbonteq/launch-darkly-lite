/**
 * Example Test Suite for LaunchDarkly Lite
 * 
 * This file demonstrates basic testing patterns and ensures
 * the Jest configuration is working correctly.
 */

describe('LaunchDarkly Lite Test Suite', () => {
  describe('Basic Jest Functionality', () => {
    it('should run Jest tests successfully', () => {
      expect(true).toBe(true);
    });

    it('should handle async operations', async () => {
      const result = await Promise.resolve('test-result');
      expect(result).toBe('test-result');
    });

    it('should test mathematical operations', () => {
      expect(2 + 2).toBe(4);
      expect(10 - 5).toBe(5);
      expect(3 * 4).toBe(12);
      expect(8 / 2).toBe(4);
    });
  });

  describe('TypeScript Support', () => {
    interface TestUser {
      id: string;
      name: string;
      email: string;
      active: boolean;
    }

    it('should work with TypeScript interfaces', () => {
      const user: TestUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        active: true
      };

      expect(user.id).toBe('user-123');
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.active).toBe(true);
    });

    it('should handle generic functions', () => {
      function identity<T>(arg: T): T {
        return arg;
      }

      expect(identity('hello')).toBe('hello');
      expect(identity(42)).toBe(42);
      expect(identity(true)).toBe(true);
    });
  });

  describe('Object and Array Testing', () => {
    it('should test object equality', () => {
      const obj1 = { name: 'Test', value: 42 };
      const obj2 = { name: 'Test', value: 42 };

      expect(obj1).toEqual(obj2);
      expect(obj1).not.toBe(obj2); // Different references
    });

    it('should test array operations', () => {
      const numbers = [1, 2, 3, 4, 5];

      expect(numbers).toHaveLength(5);
      expect(numbers).toContain(3);
      expect(numbers[0]).toBe(1);
      expect(numbers[numbers.length - 1]).toBe(5);
    });

    it('should test array methods', () => {
      const numbers = [1, 2, 3, 4, 5];
      
      const doubled = numbers.map(n => n * 2);
      expect(doubled).toEqual([2, 4, 6, 8, 10]);

      const filtered = numbers.filter(n => n > 3);
      expect(filtered).toEqual([4, 5]);

      const sum = numbers.reduce((acc, n) => acc + n, 0);
      expect(sum).toBe(15);
    });
  });

  describe('String Operations', () => {
    it('should test string methods', () => {
      const text = 'LaunchDarkly Lite';

      expect(text.toLowerCase()).toBe('launchdarkly lite');
      expect(text.toUpperCase()).toBe('LAUNCHDARKLY LITE');
      expect(text.split(' ')).toEqual(['LaunchDarkly', 'Lite']);
      expect(text.includes('Darkly')).toBe(true);
    });

    it('should test string matching', () => {
      const email = 'test@example.com';

      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(email).toMatch('@example.com');
    });
  });

  describe('Error Handling', () => {
    it('should test thrown errors', () => {
      const throwError = () => {
        throw new Error('Something went wrong');
      };

      expect(throwError).toThrow();
      expect(throwError).toThrow('Something went wrong');
      expect(throwError).toThrow(Error);
    });

    it('should test async errors', async () => {
      const asyncError = async () => {
        throw new Error('Async error');
      };

      await expect(asyncError()).rejects.toThrow('Async error');
    });
  });

  describe('Mock Functions', () => {
    it('should test mock function calls', () => {
      const mockFn = jest.fn();
      
      mockFn('arg1', 'arg2');
      mockFn('arg3');

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(mockFn).toHaveBeenLastCalledWith('arg3');
    });

    it('should test mock return values', () => {
      const mockFn = jest.fn();
      mockFn.mockReturnValue('mocked result');

      const result = mockFn();
      expect(result).toBe('mocked result');
    });

    it('should test mock implementations', () => {
      const mockFn = jest.fn((x: number) => x * 2);

      const result = mockFn(5);
      expect(result).toBe(10);
      expect(mockFn).toHaveBeenCalledWith(5);
    });
  });

  describe('Date and Time', () => {
    it('should test date operations', () => {
      const date = new Date('2023-01-01T00:00:00Z');

      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(1);
      expect(date.toISOString()).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should test date comparisons', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-02');

      expect(date2.getTime()).toBeGreaterThan(date1.getTime());
      expect(date1.getTime()).toBeLessThan(date2.getTime());
    });
  });

  describe('Environment and Configuration', () => {
    it('should access environment variables', () => {
      // Set a test environment variable
      process.env.TEST_VAR = 'test-value';

      expect(process.env.TEST_VAR).toBe('test-value');
      expect(process.env.NODE_ENV).toBe('test');
    });

    it('should test configuration objects', () => {
      const config = {
        port: 3000,
        environment: 'test',
        database: {
          host: 'localhost',
          port: 5432,
          name: 'test_db'
        },
        features: {
          enableLogging: true,
          enableMetrics: false
        }
      };

      expect(config.port).toBe(3000);
      expect(config.environment).toBe('test');
      expect(config.database.host).toBe('localhost');
      expect(config.features.enableLogging).toBe(true);
      expect(config.features.enableMetrics).toBe(false);
    });
  });

  describe('JSON Operations', () => {
    it('should serialize and deserialize JSON', () => {
      const obj = {
        id: 'test-123',
        name: 'Test Object',
        metadata: {
          created: '2023-01-01T00:00:00Z',
          tags: ['test', 'example']
        }
      };

      const json = JSON.stringify(obj);
      const parsed = JSON.parse(json);

      expect(parsed).toEqual(obj);
      expect(parsed.metadata.tags).toContain('test');
    });
  });
});

// Feature Flag Business Logic Tests
describe('Feature Flag Core Logic', () => {
  describe('Flag Evaluation', () => {
    it('should evaluate simple boolean flags', () => {
      const evaluateFlag = (enabled: boolean, defaultValue: boolean) => {
        return enabled ? true : defaultValue;
      };

      expect(evaluateFlag(true, false)).toBe(true);
      expect(evaluateFlag(false, true)).toBe(true);
      expect(evaluateFlag(false, false)).toBe(false);
    });

    it('should handle user-based targeting', () => {
      const evaluateUserFlag = (userId: string, targetUsers: string[], defaultValue: boolean) => {
        return targetUsers.includes(userId) ? true : defaultValue;
      };

      const targetUsers = ['user-1', 'user-2', 'user-3'];

      expect(evaluateUserFlag('user-1', targetUsers, false)).toBe(true);
      expect(evaluateUserFlag('user-4', targetUsers, false)).toBe(false);
      expect(evaluateUserFlag('user-5', targetUsers, true)).toBe(true);
    });

    it('should handle percentage-based rollouts', () => {
      const evaluatePercentageFlag = (userId: string, percentage: number) => {
        // Better hash function for testing
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
          const char = userId.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32bit integer
        }
        const userPercentage = Math.abs(hash) % 100;
        return userPercentage < percentage;
      };

      // Test with 50% rollout using more varied user IDs
      const results = ['user-alpha', 'user-beta', 'user-gamma', 'user-delta', 'user-epsilon']
        .map(userId => evaluatePercentageFlag(userId, 50));

      // Not all should be the same (some true, some false)
      const uniqueResults = [...new Set(results)];
      expect(uniqueResults.length).toBeGreaterThan(1);
    });
  });

  describe('Rule Priority', () => {
    interface Rule {
      id: string;
      priority: number;
      condition: (context: any) => boolean;
      value: boolean;
    }

    it('should respect rule priority order', () => {
      const rules: Rule[] = [
        {
          id: 'rule-1',
          priority: 1,
          condition: (ctx) => ctx.userId === 'user-123',
          value: false
        },
        {
          id: 'rule-2',
          priority: 2,
          condition: (ctx) => ctx.userId === 'user-123',
          value: true
        }
      ];

      const context = { userId: 'user-123' };

      // Sort by priority and find first matching rule
      const sortedRules = rules.sort((a, b) => b.priority - a.priority);
      const matchingRule = sortedRules.find(rule => rule.condition(context));

      expect(matchingRule?.id).toBe('rule-2');
      expect(matchingRule?.value).toBe(true);
    });
  });
});

// User Management Tests
describe('User Management Logic', () => {
  describe('User Validation', () => {
    it('should validate email formats', () => {
      const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });

    it('should validate user roles', () => {
      const validRoles = ['admin', 'user'];
      
      const isValidRole = (role: string): boolean => {
        return validRoles.includes(role);
      };

      expect(isValidRole('admin')).toBe(true);
      expect(isValidRole('user')).toBe(true);
      expect(isValidRole('invalid')).toBe(false);
      expect(isValidRole('')).toBe(false);
    });
  });

  describe('Permission Checks', () => {
    it('should check admin permissions', () => {
      const hasAdminPermission = (userRole: string): boolean => {
        return userRole === 'admin';
      };

      expect(hasAdminPermission('admin')).toBe(true);
      expect(hasAdminPermission('user')).toBe(false);
    });

    it('should check feature access permissions', () => {
      const canAccessFeature = (userRole: string, feature: string): boolean => {
        const permissions = {
          'create-flags': ['admin'],
          'view-flags': ['admin', 'user'],
          'delete-flags': ['admin']
        };

        return permissions[feature as keyof typeof permissions]?.includes(userRole) || false;
      };

      expect(canAccessFeature('admin', 'create-flags')).toBe(true);
      expect(canAccessFeature('user', 'create-flags')).toBe(false);
      expect(canAccessFeature('user', 'view-flags')).toBe(true);
      expect(canAccessFeature('admin', 'delete-flags')).toBe(true);
      expect(canAccessFeature('user', 'delete-flags')).toBe(false);
    });
  });
}); 