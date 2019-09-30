const { distributeUrlGroups } = require("././distribute-url-groups");

describe("distributeUrlGroups", () => {
  it("should distribute evenly over display", () => {
    const twoUrlsOneItem = distributeUrlGroups(1, ["foo", "bar"]);
    expect(twoUrlsOneItem.length).toEqual(1);
    expect(twoUrlsOneItem[0].length).toEqual(2);

    const twoUrlTwoDisplays = distributeUrlGroups(2, ["foo", "bar"]);
    expect(twoUrlTwoDisplays.length).toEqual(2);
    expect(twoUrlTwoDisplays[0].length).toEqual(1);
    expect(twoUrlTwoDisplays[1].length).toEqual(1);

    const fourUrlsThreeDisplays = distributeUrlGroups(3, [
      "foo",
      "bar",
      "baz",
      "bas"
    ]);
    expect(fourUrlsThreeDisplays.length).toEqual(3);
    expect(fourUrlsThreeDisplays[0].length).toEqual(2);
    expect(fourUrlsThreeDisplays[1].length).toEqual(1);
    expect(fourUrlsThreeDisplays[2].length).toEqual(1);
  });

  it("should flatten after distributing", () => {
    const flattenedAfterDistribute = distributeUrlGroups(2, [
      "foo",
      ["bar", "bas", "baz"]
    ]);
    expect(flattenedAfterDistribute.length).toEqual(2);
    expect(flattenedAfterDistribute[0].length).toEqual(1);
    expect(flattenedAfterDistribute[1].length).toEqual(3);
  });
});
