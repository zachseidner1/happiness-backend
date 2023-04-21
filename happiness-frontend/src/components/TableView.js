import { useState } from "react";
import BigHistoryCard from "./BigHistoryCard";
import { ReturnColor } from "./MonthView";

// Sets border styles if table cell marks beginning of new week
const weekEdge = (isBound) => {
  return isBound ? " border-r border-l-2 border-l-black " : " border-x ";
};

// Represents table cell for a user's happiness
function TableCell({ entry, setCard, boundary }) {
  let value = "-";
  if (entry !== undefined) {
    // make all values 2 digits
    value = entry.value < 10 ? entry.value.toFixed(1) : entry.value;
  }

  return (
    <td
      className={
        "border-collapse border-y p-1.5 text-center text-md font-medium text-raisin-600 " +
        (entry !== undefined ? ReturnColor(entry.value) : "bg-gray-400") +
        weekEdge(boundary) +
        (entry !== undefined && entry.comment ? "has_comment" : "")
      }
      onClick={() => setCard(entry)}
    >
      {value}
    </td>
  );
}

// TODO: smaller comment modals, why is week table so large?

export default function TableView({ groupData, happinessData, selected }) {
  const [card, setCard] = useState();

  const groupUsers = groupData.users.sort((u1, u2) => u1.id - u2.id);

  // For any 2 dates, calculates all dates + weekdays in between, any week boundaries (Mondays),
  // and the amount of days in the data that are in each month (monthSpan)
  const getDatesInBetween = (start, end) => {
    const getMonthName = (month) =>
      month.toLocaleString("en-US", { month: "long" });

    let dates = [];
    let weekdays = [];
    let weekBoundaries = [];
    let prevMonth = start.getMonth();
    let monthSpan = { [getMonthName(start)]: 0 };
    while (start <= end) {
      dates.push(start.toLocaleDateString("sv").substring(0, 10));
      weekdays.push(
        start.toLocaleString("en-us", { weekday: "long" }).substring(0, 1)
      );
      if (start.toLocaleString("en-us", { weekday: "long" }) === "Sunday") {
        weekBoundaries.push(start.toLocaleDateString("sv").substring(0, 10));
      }
      if (start.getMonth() === prevMonth) {
        monthSpan[getMonthName(start)] += 1;
      } else {
        monthSpan[getMonthName(start)] = 1;
      }
      prevMonth = start.getMonth();
      start.setDate(start.getDate() + 1);
    }
    return [dates, weekdays, weekBoundaries, monthSpan];
  };

  // Sets start date of table depending on if week or month view is selected
  const lastPeriod = new Date();
  if (selected === 1) {
    lastPeriod.setDate(lastPeriod.getDate() - 7);
  } else {
    lastPeriod.setMonth(lastPeriod.getMonth() - 1);
    lastPeriod.setDate(lastPeriod.getDate() + 1);
  }
  const [allDates, weekdays, weekBounds, monthSpan] = getDatesInBetween(
    lastPeriod,
    new Date()
  );

  // Construct table rows using happiness data
  const rows = [];
  const byDate = Object.fromEntries(allDates.map((k) => [k, []]));
  for (let user of groupUsers) {
    const entries = [];
    entries.push(
      <td className="border-collapse border py-1.5 px-2">{user.username}</td>
    );
    for (let date of allDates) {
      let entry = happinessData.find(
        (entry) => entry.user_id === user.id && entry.timestamp === date
      );
      entries.push(
        <TableCell
          entry={entry}
          setCard={setCard}
          boundary={weekBounds.includes(date)}
        />
      );
      if (entry !== undefined) {
        byDate[date].push(entry.value);
      }
    }
    rows.push(
      <tr className={rows.length === 0 ? "border-t-2 border-t-black" : ""}>
        {entries}
      </tr>
    );
  }

  // Calculate average happiness for every day
  let averages = Object.entries(byDate).map(([date, vList]) => [
    date,
    (vList.reduce((a, b) => a + b, 0.0) / vList.length).toFixed(1),
  ]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full table-fixed border-collapse border">
          <thead>
            {/* Month */}
            <tr>
              <th></th>
              {Object.entries(monthSpan).map(([month, span]) => (
                <th
                  colSpan={span}
                  className="text-center text-md font-bold text-raisin-600 border-collapse border p-1"
                >
                  {month}
                </th>
              ))}
            </tr>
            {/* Day of week */}
            <tr>
              <th></th>
              {weekdays.map((day, i) => (
                <th
                  className={
                    "text-center text-xs font-medium text-raisin-600 pt-1 pb-1 border-collapse border-y" +
                    weekEdge(
                      day === "S" && (i === 0 || weekdays[i - 1] === "S")
                    )
                  }
                >
                  {day}
                </th>
              ))}
            </tr>
            {/* Day */}
            <tr>
              <th></th>
              {allDates.map((date) => (
                <th
                  className={
                    "text-center text-md font-bold text-raisin-600 border-collapse border-y p-1.5" +
                    weekEdge(weekBounds.includes(date))
                  }
                >
                  {date.substring(8)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Happiness data for each user */}
            {rows.map((row) => row)}
            {/* Average happiness for each day */}
            <tr className="border-t-2 border-t-black">
              <td className="py-1.5 px-2">Average</td>
              {averages.map(([date, avg]) => (
                <td
                  className={
                    "text-center text-md font-medium text-raisin-600 border-collapse p-1.5 " +
                    (!isNaN(avg) ? ReturnColor(avg) : "bg-gray-400") +
                    weekEdge(weekBounds.includes(date))
                  }
                >
                  {isNaN(avg) ? "-" : avg}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {/* Show comment for selected happiness entry */}
      {card && (
        <BigHistoryCard
          data={card}
          user={groupUsers.find((e) => e.id === card.user_id)}
        />
      )}
    </div>
  );
}
