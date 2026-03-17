// @ts-check

import {
  describe,
  beforeAll,
  it,
  expect,
} from '@jest/globals';
import fastify from 'fastify';
import { faker } from '@faker-js/faker';
import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;
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

  const createStatus = async (params, cookie) => {
    const statusParams = params || { name: faker.word.noun() };

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('statuses'),
      payload: { data: statusParams },
      cookies: cookie,
    });

    const status = await models.taskStatus.query().findOne({ name: statusParams.name });
    return { response, status, params: statusParams };
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
      url: app.reverse('statuses'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const { cookie } = await signIn(testData.users.existing);

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newStatus'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const { cookie } = await signIn(testData.users.existing);
    const { response, status, params } = await createStatus(undefined, cookie);

    expect(response.statusCode).toBe(302);
    expect(status).toMatchObject(params);
  });

  it('create with invalid name fails', async () => {
    const { cookie } = await signIn(testData.users.existing);

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('statuses'),
      payload: { data: { name: '' } },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);

    const status = await models.taskStatus.query().findOne({ name: '' });
    expect(status).toBeUndefined();
  });

  it('edit', async () => {
    const { cookie } = await signIn(testData.users.existing);
    const { status } = await createStatus(undefined, cookie);

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editStatus', { id: status.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('update', async () => {
    const { cookie } = await signIn(testData.users.existing);
    const { status } = await createStatus(undefined, cookie);

    const newName = faker.word.noun();
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateStatus', { id: status.id }),
      payload: { data: { name: newName } },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const updated = await models.taskStatus.query().findById(status.id);
    expect(updated.name).toBe(newName);
  });

  it('delete', async () => {
    const { cookie } = await signIn(testData.users.existing);
    const { status } = await createStatus(undefined, cookie);

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteStatus', { id: status.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const deleted = await models.taskStatus.query().findById(status.id);
    expect(deleted).toBeUndefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
