export default {
  maxInstances: 1,
  capabilities: [
    /*{
      maxInstances: 1,
      browserName: 'chrome',
      platform: 'OS X 10.11',
      version: 'latest',
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      build: process.env.TRAVIS_BUILD_NUMBER
    },*/
    {
      maxInstances: 1,
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '11.0',
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      build: process.env.TRAVIS_BUILD_NUMBER
    }
  ]
};
