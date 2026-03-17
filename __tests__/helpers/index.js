import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';

const getFixturePath = (filename) => path.join('..', '..', '__fixtures__', filename);
const readFixture = (filename) => {
  const url = new URL(getFixturePath(filename), import.meta.url);
  return fs.readFileSync(url, 'utf-8').trim();
};
const getFixtureData = (filename) => JSON.parse(readFixture(filename));

export const getTestData = () => getFixtureData('testData.json');

export const prepareData = async (app) => {
  const { knex } = app.objection;

  await knex('users').insert(getFixtureData('users.json'));
};

export const generateUser = (overrides = {}) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName }).toLowerCase();
  const password = faker.internet.password(10);

  return {
    firstName,
    lastName,
    email,
    password,
    ...overrides,
  };
};

export const signIn = async (app, { email, password }) => {
  const response = await app.inject({
    method: 'POST',
    url: app.reverse('session'),
    payload: { data: { email, password } },
  });
  const [sessionCookie] = response.cookies;
  const cookie = sessionCookie ? { [sessionCookie.name]: sessionCookie.value } : {};

  return { response, cookie };
};

