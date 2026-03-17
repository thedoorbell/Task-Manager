import _ from 'lodash';
import fastify from 'fastify';

import init from '../server/plugin.js';
import encrypt from '../server/lib/secure.cjs';
import {
  getTestData,
  prepareData,
  generateUser,
  signIn,
} from './helpers/index.js';

describe('test users CRUD', () => {
  let app;
  let knex;
  let models;
  let testData;

  const createUser = async (params) => {
    const userParams = params || generateUser();
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: { data: userParams },
    });
    const user = await models.user.query().findOne({ email: userParams.email });
    return { response, user, params: userParams };
  };

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    });
    await init(app);
    ({ knex } = app.objection);
    ({ models } = app.objection);

    await knex.migrate.latest();
    await prepareData(app);
    testData = getTestData();
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const { response, user, params } = await createUser(generateUser());

    expect(response.statusCode).toBe(302);

    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    expect(user).toMatchObject(expected);
  });

  it('create with invalid email fails', async () => {
    const invalidParams = {
      ...generateUser(),
      email: 'not-an-email',
    };

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: { data: invalidParams },
    });

    expect(response.statusCode).toBe(200);

    const user = await models.user.query().findOne({ email: invalidParams.email });
    expect(user).toBeUndefined();
  });

  it('create with existing email fails', async () => {
    const { existing } = testData.users;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: { data: existing },
    });

    expect(response.statusCode).toBe(200);

    const users = await models.user.query().where({ email: existing.email });
    expect(users).toHaveLength(1);
  });

  it('edit user only for owner', async () => {
    const { user: owner, params } = await createUser(generateUser());
    const { cookie } = await signIn(app, { email: params.email, password: params.password });

    // Another user from fixtures
    const other = await models.user.query().first().whereNot({ id: owner.id });

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editUser', { id: other.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
  });

  it('update user', async () => {
    const { user, params } = await createUser(generateUser());
    const { cookie } = await signIn(app, { email: params.email, password: params.password });

    const newLastName = 'Updated';
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateUser', { id: user.id }),
      payload: { data: { lastName: newLastName } },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const updated = await models.user.query().findById(user.id);
    expect(updated.lastName).toBe(newLastName);
  });

  it('update user with invalid data fails', async () => {
    const { user, params } = await createUser(generateUser());
    const { cookie } = await signIn(app, { email: params.email, password: params.password });

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateUser', { id: user.id }),
      payload: { data: { email: 'invalid' } },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);

    const updated = await models.user.query().findById(user.id);
    expect(updated.email).toBe(user.email);
  });

  it('delete user', async () => {
    const { user, params } = await createUser(generateUser());
    const { cookie } = await signIn(app, { email: params.email, password: params.password });

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteUser', { id: user.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const deleted = await models.user.query().findById(user.id);
    expect(deleted).toBeUndefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
