import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { ContentType } from '../../list/dto/create-list-item.dto';

describe('List Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users/:username/list', () => {
    it('should add item to user list', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/testuser/list')
        .send({
          listItem: {
            contentId: 'movie123',
            contentType: ContentType.MOVIE,
          },
        })
        .expect(201);

      expect(response.body.myList).toContainEqual({
        contentId: 'movie123',
        contentType: ContentType.MOVIE,
      });
    });

    it('should prevent adding duplicate items', async () => {
      await request(app.getHttpServer())
        .post('/users/testuser/list')
        .send({
          listItem: {
            contentId: 'movie123',
            contentType: ContentType.MOVIE,
          },
        })
        .expect(409);
    });
  });

  describe('GET /users/:username/list', () => {
    beforeEach(async () => {
      // Add multiple items for pagination test
      await request(app.getHttpServer())
        .post('/users/testuser/list')
        .send({
          listItem: {
            contentId: 'movie456',
            contentType: ContentType.MOVIE,
          },
        });
    });

    it('should retrieve paginated list items', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/testuser/list?limit=1&offset=0')
        .expect(200);

      expect(response.body.items.length).toBe(1);
      expect(response.body.total).toBeGreaterThan(1);
    });
  });

  describe('DELETE /users/:username/list', () => {
    it('should remove item from user list', async () => {
      await request(app.getHttpServer())
        .delete('/users/testuser/list')
        .send({
          contentId: 'movie123',
          contentType: ContentType.MOVIE,
        })
        .expect(200);
    });

    it('should return 404 when removing non-existent item', async () => {
      await request(app.getHttpServer())
        .delete('/users/testuser/list')
        .send({
          contentId: 'nonexistent',
          contentType: ContentType.MOVIE,
        })
        .expect(404);
    });
  });
});
