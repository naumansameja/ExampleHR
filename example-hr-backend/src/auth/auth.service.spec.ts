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

  it('returns a JWT with user id when email exists', async () => {
    findByEmail.mockResolvedValue({ id: 42, email: 'a@ex.com' });

    const result = await service.login({
      email: 'a@ex.com',
    });

    expect(result.access_token).toBe('signed-jwt');
    expect(signAsync).toHaveBeenCalledWith({ sub: 42 });
    expect(findByEmail).toHaveBeenCalledWith('a@ex.com');
  });

  it('rejects unknown email', async () => {
    findByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@ex.com',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
