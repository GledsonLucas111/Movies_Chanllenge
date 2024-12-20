import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnThis(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Gledson',
        email: 'Gledson1@example.com',
        password: '123567@',
        role: UserRole.USER,
      };

      const hashedPassword: string =
        '$2b$10$WICWKXglrexXHZJxbXNuquAC311J9fYEouuWBzr/MBtUtTsNLBz0O';

      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => hashedPassword);

      const savedUser: User = {
        ...createUserDto,
        id: 123456,
        password: hashedPassword,
      };

      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);

      const result = await userService.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('123567@', 10);

      expect(mockUserRepository.save).toHaveBeenCalledWith(savedUser);

      expect(result).toEqual(savedUser);
    });
  });

  describe('findAll', () => {
    it('shoud return a user list with sucess', async () => {
      const userList: User[] = [
        {
          id: 12345,
          name: 'Gledson',
          email: 'gledson@example.com',
          password: '123456',
          role: UserRole.USER,
        },
        {
          id: 1234,
          name: 'Maria',
          email: 'maria@example.com',
          password: '123456',
          role: UserRole.USER,
        },
      ];

      mockUserRepository.find.mockResolvedValue(userList);

      const result = await userService.findAll();
      expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(userList);
    });
  });
  describe('findOne', () => {
    it('should return a user when a valid ID is provided', async () => {
      const userId = 12345;
      const user: User = {
        id: userId,
        name: 'Gledson',
        email: 'gledson@example.com',
        password: '123456',
        role: UserRole.USER,
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await userService.findOne(user.id);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
      });
      expect(result).toEqual(user);
    });
    it('should throw an error when the user is not found', async () => {
      const userId = 12345;

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(userService.findOne(userId)).rejects.toThrowError(
        'User not found.',
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
  describe('Update', () => {
    it('should update and return the updated user when a valid ID is provided', async () => {
      const userId = 12345;
      const updateUserDto = { email: 'newemail@gmail.com' };
      const user: User = {
        id: userId,
        name: 'Gledson',
        email: 'gledson@example.com',
        password: '123456',
        role: UserRole.USER,
      };
      // busca pelo usuario
      mockUserRepository.findOne.mockResolvedValue(user);

      // salvemtno do usuario atualizado
      const updateUser = { ...user, ...updateUserDto };
      mockUserRepository.save.mockResolvedValue(updateUser);

      const result = await userService.update(user.id, updateUserDto);

      // verifica se o repositoria foi chamdado corretamente
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(updateUser);

      // veridica se o resultado do metodo esta correto
      expect(result).toEqual(updateUser);
    });
  });
  describe('Delete', () => {
    it('should remove the user when a valid ID is provided', async () => {
      const userId = 12345;
      const user: User = {
        id: userId,
        name: 'Gledson',
        email: 'gledson@example.com',
        password: '123456',
        role: UserRole.USER,
      };
      // busca pelo usuario
      mockUserRepository.findOne.mockResolvedValue(user);

      // simula a exclusao bem sucedida
      mockUserRepository.remove.mockResolvedValue(undefined);

      await userService.remove(user.id);

      // verifica se o repositoria foi chamdado corretamente
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
      });
      expect(mockUserRepository.remove).toHaveBeenCalledWith(user);
    });
  });
});
