import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ returns validation-rule author data', () => {
    const expected = {
      message: 'My Rule-Validation API',
      status: 'success',
      data: {
        name: 'Aminu Abdulmalik',
        github: '@miawoltn',
        email: 'amnabdulmalik@gmail.com',
        mobile: '08069036740',
      },
    };
    return request(app.getHttpServer()).get('/').expect(200).expect(expected);
  });
  it('/validate-rule should return 200 and success message for successful validation', async () => {
    const body = {
      rule: {
        field: 'missions.count',
        condition: 'gte',
        condition_value: 30,
      },
      data: {
        name: 'James Holden',
        crew: 'Rocinante',
        age: 34,
        position: 'Captain',
        missions: {
          count: 45,
          successful: 44,
          failed: 1,
        },
      },
    };

    const expected = {
      message: 'field missions.count successfully validated.',
      status: 'success',
      data: {
        validation: {
          error: false,
          field: 'missions.count',
          field_value: 45,
          condition: 'gte',
          condition_value: 30,
        },
      },
    };

    return await request(app.getHttpServer())
      .post('/validate-rule')
      .send(body)
      .expect(200)
      .expect(expected);
  });

  it('/validate-rule should return 400 and validation message and data for failed validation', async () => {
    const body = {
      rule: {
        field: '0',
        condition: 'eq',
        condition_value: 'a',
      },
      data: 'damien-marley',
    };

    const expected = {
      message: 'field 0 failed validation.',
      status: 'error',
      data: {
        validation: {
          error: true,
          field: '0',
          field_value: 'd',
          condition: 'eq',
          condition_value: 'a',
        },
      },
    };

    return await request(app.getHttpServer())
      .post('/validate-rule')
      .send(body)
      .expect(400)
      .expect(expected);
  });

  it('/validate-rule should return 400 for missing data', async () => {
    const body = {
      rule: {
        field: '5',
        condition: 'contains',
        condition_value: 'rocinante',
      },
      data: ['The Nauvoo', 'The Razorback', 'The Roci', 'Tycho'],
    };

    const expected = {
      message: 'field 5 is missing from data.',
      status: 'error',
      data: null,
    };

    return await request(app.getHttpServer())
      .post('/validate-rule')
      .send(body)
      .expect(400)
      .expect(expected);
  });
});
