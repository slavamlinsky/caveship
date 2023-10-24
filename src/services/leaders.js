/** Sorting Top Score Players Results from LocalStorage */
export function sortLeadersByScore(leadersData, sort = "asc") {
  let sortedData;

  if (sort === "desc") {
    sortedData = leadersData.sort((a, b) => b.score - a.score);
  } else {
    sortedData = leadersData.sort((a, b) => a.score - b.score);
  }

  return sortedData;
}

/** Add winner`s score to the leaders array in localstorage */

export function addLeader(newLeader) {
  let leaders = [];
  if (JSON.parse(localStorage.getItem("leaders"))) {
    leaders = JSON.parse(localStorage.getItem("leaders"));
  }

  leaders.push(newLeader);

  localStorage.setItem("leaders", JSON.stringify(leaders));
}

/** Counting minimal score value to add new one in TOP 10 table */
export function getMinLeadersScore() {
  const leaders = JSON.parse(localStorage.getItem("leaders"));

  const minScore = leaders.reduce((prev, curr) =>
    prev.score > curr.score ? prev : curr
  );

  return minScore.score;
}
