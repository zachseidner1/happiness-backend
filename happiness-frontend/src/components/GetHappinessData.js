import { useApi } from "../contexts/ApiProvider";
import { useQuery } from "react-query";

// Gets list of Happiness objects for given user (from the past 7 days)
export function PrevWeekData(userMode, id) {
  const api = useApi();
  const lastWk = new Date();
  lastWk.setDate(lastWk.getDate() - 7);
  const weekData = lastWk.toISOString().substring(0, 10);
  const get_url =
    (userMode ? `/happiness/?id=${id}&` : `/group/${id}/happiness?`) +
    `start=${weekData}`;
  const {
    isLoading: isLoadingH,
    data: dataH,
    error: errorH,
  } = useQuery("weekly happiness data " + get_url, () =>
    api.get(get_url).then((res) => res.data)
  );
  return [isLoadingH, dataH, errorH];
}
// Gets list of Happiness objects for given user (from the past month)
export function PrevMonthData(userMode, id) {
  const lastMt = new Date();
  lastMt.setMonth(lastMt.getMonth() - 1);

  const api = useApi();
  const monthData = lastMt.toISOString().substring(0, 10);
  const get_url =
    (userMode ? `/happiness/?id=${id}&` : `/group/${id}/happiness?`) +
    `start=${monthData}`;
  const {
    isLoading: isLoadingHM,
    data: dataHM,
    error: errorHM,
  } = useQuery("monthly happiness data " + get_url, () =>
    api.get(get_url).then((res) => res.data)
  );
  return [isLoadingHM, dataHM, errorHM];
}

export function GetCountHappiness(count, user, page = 1) {
  const api = useApi();
  const { isLoading, data, error } = useQuery("get happiness by count", () =>
    api
      .get(
        "/happiness/count/?count=" + count + "&id=" + user.id + "&page=" + page
      )
      .then((res) => res.data)
  );
  return [isLoading, data, error];
}
