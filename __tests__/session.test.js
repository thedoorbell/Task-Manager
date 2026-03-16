// @ts-check

import fastify from 'fastify';
import init from '../server/plugin.js';
import { getTestData, prepareData, generateUser } from './helpers/index.js';

describe('test session', () => {
  let app;
  let knex;
  let testData;

  const signIn = async ({ email, password }) => {
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: { data: { email, password } },
    });

    const [sessionCookie] = response.cookies;
    const cookie = sessionCookie ? { [sessionCookie.name]: sessionCookie.value } : {};

    return { response, cookie };
  };

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    });
    await init(app);
    ({ knex } = app.objection);
    await knex.migrate.latest();
    await prepareData(app);
    testData = getTestData();
  });

  it('sign in / sign out', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newSession'),
    });

    expect(response.statusCode).toBe(200);

    const { response: responseSignIn, cookie } = await signIn(testData.users.existing);

    expect(responseSignIn.statusCode).toBe(302);

    const responseSignOut = await app.inject({
      method: 'DELETE',
      url: app.reverse('session'),
      cookies: cookie,
    });

    expect(responseSignOut.statusCode).toBe(302);
  });

  it('sign in with invalid password', async () => {
    const { response } = await signIn({
      email: testData.users.existing.email,
      password: 'wrong-password',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('Неправильный емейл или пароль');
  });

  it('sign in with non-existing user', async () => {
    const fakeUser = generateUser();
    const { response } = await signIn({ email: fakeUser.email, password: fakeUser.password });
    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('Неправильный емейл или пароль');
  });

  afterAll(async () => {
    // await knex.migrate.rollback();
    await app.close();
  });
});
