import { AuthService } from '../../services/AuthService';
import { userRepository } from '../../repositories/UserRepository';

jest.mock('../../repositories/UserRepository', () => ({
  userRepository: {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    findById: jest.fn(),
  },
}));

describe('AuthService Unit Tests', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw error if email already exists', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({ email: 'test@test.com' });

      await expect(
        authService.register('Test User', 'test@test.com', 'Password123'),
      ).rejects.toThrow('An account with this email already exists.');
    });

    it('should register successfully if email does not exist', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      const mockUser = {
        _id: 'mock-id-123',
        name: 'Test User',
        email: 'test@test.com',
      };
      (userRepository.createUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.register('Test User', 'test@test.com', 'Password123');

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@test.com');
      expect(userRepository.createUser).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@test.com',
        password: 'Password123',
      });
      expect(result.user).toEqual(mockUser);
      expect(result.token).toBeDefined();
    });
  });

  describe('login', () => {
    it('should throw error if user does not exist', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login('notfound@test.com', 'Password123')).rejects.toThrow(
        'Invalid email or password.',
      );
    });

    it('should throw error if password does not match', async () => {
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.login('test@test.com', 'WrongPassword')).rejects.toThrow(
        'Invalid email or password.',
      );
    });

    it('should return user and token on correct password', async () => {
      const mockUser = {
        _id: 'user-id-555',
        name: 'Test User',
        email: 'test@test.com',
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.login('test@test.com', 'CorrectPassword');

      expect(mockUser.comparePassword).toHaveBeenCalledWith('CorrectPassword');
      expect(result.user).toEqual(mockUser);
      expect(result.token).toBeDefined();
    });
  });
});
