const config = require('./config.json');
const {DB} = require('./db');
const {Bot} = require('./bot');
const tasks = require('./tasks');
const {getManyVersions} = require('./github-client');


const main = async () => {
  const db = new DB(config.mongodb.url, config.mongodb.name);

  await db.init();

  const bot = new Bot(db);

  const updateReleasesTask = async () => {
    const repos = await db.getAllRepos();

    const updates = await getManyVersions(repos.map(({owner, name}) => ({owner, name})), 1);

    return await db.updateRepos(updates);
  };

  tasks.add('releases', updateReleasesTask, 60*5);
  tasks.subscribe('releases', bot.notifyUsers.bind(bot));
};


main();