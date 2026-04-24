import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    process.env.SQLITE_STORAGE = ':memory:';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    delete process.env.SQLITE_STORAGE;
    await app.close();
  });

  it('POST /api/v1/users then GET /api/v1/users', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/users')
      .send({ name: 'Bob', email: 'bob@example.com', hcmId: 'hcm_99' })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toBe('Bob');
        expect(res.body.email).toBe('bob@example.com');
        expect(res.body.hcmId).toBe('hcm_99');
        expect(res.body.id).toBeDefined();
      });

    const res = await request(app.getHttpServer()).get('/api/v1/users').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].hcmId).toBe('hcm_99');
  });
});
