import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const findByEmail = jest.fn();
  const signAsync = jest.fn();

  beforeEach(async () => {
    process.env.AUTH_SHARED_PASSWORD = 'same-for-everyone';
    findByEmail.mockReset();
    signAsync.mockReset();
    signAsync.mockResolvedValue('signed-jwt');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: { findByEmail } },
        { provide: JwtService, useValue: { signAsync } },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  afterEach(() => {
    delete process.env.AUTH_SHARED_PASSWORD;
  });

  it('returns a JWT with user id when email and password match', async () => {
    findByEmail.mockResolvedValue({ id: 42, email: 'a@ex.com' });

    const result = await service.login({
      email: 'a@ex.com',
      password: 'same-for-everyone',
    });

    expect(result.access_token).toBe('signed-jwt');
    expect(signAsync).toHaveBeenCalledWith({ sub: 42 });
    expect(findByEmail).toHaveBeenCalledWith('a@ex.com');
  });

  it('rejects wrong password', async () => {
    await expect(
      service.login({ email: 'a@ex.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(findByEmail).not.toHaveBeenCalled();
  });

  it('rejects unknown email', async () => {
    findByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@ex.com',
        password: 'same-for-everyone',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
