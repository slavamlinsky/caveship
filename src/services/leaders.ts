interface Leader {
  name: string;
  complexity: string;
  score: string | null | undefined;
}

/** Sorting Top Score Players Results from LocalStorage */
export function sortLeadersByScore(leadersData: Leader[], sort: "asc" | "desc" = "asc"): Leader[] {
  let sortedData = [...leadersData];

  if (sort === "desc") {
    return sortedData.sort((a, b) => Number(b.score) - Number(a.score));
  } else {
    return sortedData.sort((a, b) => Number(a.score) - Number(b.score));
  }
}

/** Add winner`s score to the leaders array in localstorage */
export function addLeader(newLeader: Leader): void {
  try {
    let leaders: Leader[] = JSON.parse(localStorage.getItem("leaders")!) || [];
    leaders.push(newLeader);
    localStorage.setItem("leaders", JSON.stringify(leaders));
  } catch (error) {
    console.error("Error adding leader:", error);
  }
}

/** Counting minimal score value to add new one in TOP 10 table */
export function getMinLeadersScore(): string | null | undefined {
  const leaders = JSON.parse(localStorage.getItem("leaders")!) as Leader[] | null;

  if (leaders) {
    const minScore = leaders.reduce((prev, curr) =>
      Number(prev.score) > Number(curr.score) ? prev : curr
    );

    return minScore.score;
  }

  return null;
}