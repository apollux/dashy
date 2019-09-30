const R = require("ramda");

const distribute = R.curry((n, values) => {
  const reduceIndexed = R.addIndex(R.reduce);
  return reduceIndexed(
    (acc, value, index) => {
      if (index < n) {
        acc = R.append([], acc);
      }
      const bucket = index < n ? index : index % n;

      acc[bucket] = R.append(value, acc[bucket]);
      return acc;
    },
    [],
    values
  );
});

const distributeUrlGroups = R.curry((number, urlGroups) =>
  R.map(R.flatten, distribute(number, urlGroups))
);

module.exports = { distributeUrlGroups };
