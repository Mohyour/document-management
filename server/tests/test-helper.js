import faker from 'faker';

export default {
  adminRole: {
    title: 'admin'
  },

  regularRole: {
    title: 'regular'
  },

  adminUser: {
    username: faker.internet.userName(),
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  },

  regularUser: {
    username: faker.internet.userName(),
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  },

  testUser: {
    username: faker.internet.userName(),
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  },

  testDocument: {
    title: faker.company.catchPhrase(),
    content: faker.lorem.paragraph()
  },

  testDocument2: {
    title: faker.finance.accountName(),
    content: faker.lorem.paragraph(),
  },

  testDocument3: {
    title: faker.commerce.department(),
    content: faker.lorem.paragraph()
  }
};
