import fastify from 'fastify';
import { faker } from '@faker-js/faker';
import init from '../server/plugin.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test labels CRUD', () => {
  let app;
  let knex;
  let models;
  let testData;

  const createLabel = async (name = faker.word.noun()) => {
    const label = await models.label.query().insert({ name });
    return label;
  };

  const createStatus = async (name = faker.word.noun()) => {
    const status = await models.taskStatus.query().insert({ name });
    return status;
  };

  const createTask = async ({ cookie, statusId, data } = {}) => {
    const taskData = data || {
      name: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      statusId,
      executorId: '',
    };

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('tasks'),
      payload: { data: taskData },
      cookies: cookie,
    });

    const task = await models.task.query().findOne({ name: taskData.name });
    return { response, task, taskData };
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
      url: app.reverse('labels'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const { cookie } = await signIn(app, testData.users.existing);

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newLabel'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const { cookie } = await signIn(app, testData.users.existing);
    const labelName = faker.word.noun();

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('labels'),
      payload: { data: { name: labelName } },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const label = await models.label.query().findOne({ name: labelName });
    expect(label).toBeDefined();
    expect(label.name).toBe(labelName);
  });

  it('create invalid fails', async () => {
    const { cookie } = await signIn(app, testData.users.existing);

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('labels'),
      payload: { data: { name: '' } },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);

    const label = await models.label.query().findOne({ name: '' });
    expect(label).toBeUndefined();
  });

  it('edit', async () => {
    const { cookie } = await signIn(app, testData.users.existing);
    const label = await createLabel();

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editLabel', { id: label.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('update', async () => {
    const { cookie } = await signIn(app, testData.users.existing);
    const label = await createLabel();
    const newName = `${label.name}-updated`;

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateLabel', { id: label.id }),
      payload: { data: { name: newName } },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const updated = await models.label.query().findById(label.id);
    expect(updated.name).toBe(newName);
  });

  it('delete label with no tasks', async () => {
    const { cookie } = await signIn(app, testData.users.existing);
    const label = await createLabel();

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteLabel', { id: label.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const deleted = await models.label.query().findById(label.id);
    expect(deleted).toBeUndefined();
  });

  it('delete label blocked when tasks exist', async () => {
    const { cookie } = await signIn(app, testData.users.existing);
    const status = await createStatus();
    const { task } = await createTask({ statusId: status.id, cookie });
    const label = await createLabel();

    await label.$relatedQuery('tasks').relate(task.id);

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteLabel', { id: label.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const found = await models.label.query().findById(label.id);
    expect(found).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
