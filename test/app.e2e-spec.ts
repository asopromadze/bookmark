import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthState } from 'src/auth/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  function testEmptySignInSignUpBody(
    auth: AuthState,
    path: '/auth/signin' | '/auth/signup',
  ) {
    it('Should throw error if email is empty', () => {
      return pactum
        .spec()
        .post(path)
        .withBody({
          password: auth.password,
        })
        .expectStatus(400)
        .toss();
    });

    it('Should throw error if password is empty', () => {
      return pactum
        .spec()
        .post(path)
        .withBody({
          email: auth.email,
        })
        .expectStatus(400)
        .toss();
    });
    it('Should throw error if body is empty', () => {
      return pactum.spec().post(path).expectStatus(400).toss();
    });
  }

  describe('Auth', () => {
    const auth: AuthState = {
      email: 'test@test.com',
      password: '123',
    };
    describe('Signup', () => {
      testEmptySignInSignUpBody(auth, '/auth/signup');
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(auth)
          .expectStatus(201)
          .toss();
      });
    });
    describe('SignIn', () => {
      testEmptySignInSignUpBody(auth, '/auth/signin');
      it('should signIn', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(auth)
          .expectStatus(200)
          .stores('userAt', 'access_token')
          .toss();
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get me', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .toss();
      });
    });
    describe('Edit user', () => {
      it('Should edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            firstName: 'test',
            lastName: 'test',
          })
          .expectStatus(200)
          .toss();
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmark', () => {
      it('Should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([])
          .toss();
      });
    });
    describe('Create bookmark', () => {
      const body: CreateBookmarkDto = {
        title: 'test',
        link: 'https://test.com',
        description: 'test',
      };
      it('Should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(body)
          .expectStatus(201)
          .stores('bookmarkId', 'id')
          .toss();
      });
    });
    describe('Get bookmarks', () => {
      it('Should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1)
          .toss();
      });
    });
    describe('Get bookmark by id', () => {
      it('Should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .toss();
      });
    });
    describe('Edit bookmark', () => {
      const body: EditBookmarkDto = {
        title: 'edited',
        link: 'https://test.com',
        description: 'test',
      };
      it('Should edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(body)
          .expectStatus(200)
          .toss();
      });
    });
    describe('Delete bookmark', () => {
      it('Should get delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204)
          .toss();
      });
      it('Should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0)
          .toss();
      });
    });
  });
});
