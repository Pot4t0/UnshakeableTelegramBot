const query = require('./query');
const main = async () => {
  const result = await query.insert(
    'wishTable',
    ['eventName', 'name', 'wish'],
    ['test1', 'test2', 'test3']
  );
  console.log(Number(result.insertId));
};

main();
