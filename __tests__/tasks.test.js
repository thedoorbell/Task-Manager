// @ts-check

import fastify from 'fastify'
import { faker } from '@faker-js/faker'
import init from '../server/plugin.js'
import { getTestData, prepareData } from './helpers/index.js'

describe('test tasks CRUD', () => {
  let app
  let knex
  let models
  let testData

  const signIn = async ({ email, password }) => {
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: { data: { email, password } },
    })

    const [sessionCookie] = response.cookies
    const cookie = sessionCookie ? { [sessionCookie.name]: sessionCookie.value } : {}

    return { response, cookie }
  }

  const createStatus = async (name = faker.word.noun()) => {
    return models.taskStatus.query().insert({ name })
  }

  const createTask = async ({ statusId, executorId = null, cookie, data } = {}) => {
    const taskData = data || {
      name: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      statusId,
      executorId: executorId ?? '',
    }

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('tasks'),
      payload: { data: taskData },
      cookies: cookie,
    })

    const task = await models.task.query().findOne({ name: taskData.name })
    return { response, task, taskData }
  }

  const createUser = async (userParams) => {
    const payload = userParams || {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password(10),
    }

    await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: { data: payload },
    })

    const user = await models.user.query().findOne({ email: payload.email })

    return { user, params: payload }
  }

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    })
    await init(app)
    knex = app.objection.knex
    models = app.objection.models

    await knex.migrate.latest()
    await prepareData(app)
    testData = getTestData()
  })

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks'),
    })

    expect(response.statusCode).toBe(200)
  })

  it('new', async () => {
    const { cookie } = await signIn(testData.users.existing)

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newTask'),
      cookies: cookie,
    })

    expect(response.statusCode).toBe(200)
  })

  it('create', async () => {
    const { cookie } = await signIn(testData.users.existing)
    const status = await createStatus()

    const { response, task, taskData } = await createTask({ statusId: status.id, cookie })

    expect(response.statusCode).toBe(302)
    expect(task).toMatchObject({
      name: taskData.name,
      description: taskData.description,
      statusId: status.id,
      creatorId: expect.any(Number),
    })
  })

  it('create with multiple labels works and persists', async () => {
    const { cookie } = await signIn(testData.users.existing)
    const status = await createStatus()
    const label1 = await models.label.query().insert({ name: 'label1' })
    const label2 = await models.label.query().insert({ name: 'label2' })

    const taskName = `task-${Date.now()}`
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('tasks'),
      payload: { data: {
        name: taskName,
        description: 'desc',
        statusId: status.id,
        executorId: '',
        labels: [label1.id, label2.id],
      } },
      cookies: cookie,
    })

    expect(response.statusCode).toBe(302)

    const task = await models.task.query().findOne({ name: taskName })
    expect(task).toBeDefined()

    const relatedLabels = await task.$relatedQuery('labels')
    expect(relatedLabels.map((l) => l.id).sort()).toEqual([label1.id, label2.id].sort())
  })

  it('create with invalid name fails', async () => {
    const { cookie } = await signIn(testData.users.existing)
    const status = await createStatus()

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('tasks'),
      payload: { data: { name: '', description: 'a', statusId: status.id, executorId: '' } },
      cookies: cookie,
    })

    expect(response.statusCode).toBe(200)

    const task = await models.task.query().findOne({ description: 'a' })
    expect(task).toBeUndefined()
  })

  it('show', async () => {
    const { cookie } = await signIn(testData.users.existing)
    const status = await createStatus()
    const { task } = await createTask({ statusId: status.id, cookie })

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('showTask', { id: task.id }),
      cookies: cookie,
    })

    expect(response.statusCode).toBe(200)
  })

  it('edit', async () => {
    const { cookie } = await signIn(testData.users.existing)
    const status = await createStatus()
    const { task } = await createTask({ statusId: status.id, cookie })

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editTask', { id: task.id }),
      cookies: cookie,
    })

    expect(response.statusCode).toBe(200)
  })

  it('update', async () => {
    const { cookie } = await signIn(testData.users.existing)
    const status = await createStatus()
    const { task } = await createTask({ statusId: status.id, cookie })

    const newName = `${task.name}-updated`
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateTask', { id: task.id }),
      payload: { data: { name: newName, statusId: status.id, executorId: '' } },
      cookies: cookie,
    })

    expect(response.statusCode).toBe(302)

    const updated = await models.task.query().findById(task.id)
    expect(updated.name).toBe(newName)
  })

  it('delete by creator', async () => {
    const { cookie } = await signIn(testData.users.existing)
    const status = await createStatus()
    const { task } = await createTask({ statusId: status.id, cookie })

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteTask', { id: task.id }),
      cookies: cookie,
    })

    expect(response.statusCode).toBe(302)

    const deleted = await models.task.query().findById(task.id)
    expect(deleted).toBeUndefined()
  })

  it('delete not allowed for non-creator', async () => {
    const { cookie: cookie1 } = await signIn(testData.users.existing)
    const status = await createStatus()
    const { task } = await createTask({ statusId: status.id, cookie: cookie1 })

    const { params: secondUserParams } = await createUser()
    const { cookie: cookie2 } = await signIn({
      email: secondUserParams.email,
      password: secondUserParams.password,
    })

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteTask', { id: task.id }),
      cookies: cookie2,
    })

    expect(response.statusCode).toBe(302)

    const notDeleted = await models.task.query().findById(task.id)
    expect(notDeleted).toBeDefined()
  })

  afterAll(async () => {
    await app.close()
  })
})
