import React from "react";
import { VictoryChart, VictoryBar, VictoryTheme, VictoryAxis } from "victory";
import { startOfYear, addWeeks, startOfWeek, endOfWeek } from "date-fns";
import "./Chart.css";

export default function Chart({ expenditure, currency }) {
    const weekNumber = 21;

    const getStartOfWeekDate = (weekNumber) => {
      const firstDayOfYear = startOfYear(new Date());
      const startOfWeekDate = startOfWeek(
        addWeeks(firstDayOfYear, weekNumber - 1),
        { weekStartsOn: 1 }
      );
      return startOfWeekDate;
    };
    
    const getEndOfWeekDate = (weekNumber) => {
      const firstDayOfYear = startOfYear(new Date());
      const startOfWeekDate = startOfWeek(
        addWeeks(firstDayOfYear, weekNumber - 1),
        { weekStartsOn: 1 }
      );
      const endOfWeekDate = endOfWeek(startOfWeekDate, { weekStartsOn: 1 });
      return endOfWeekDate;
    };
    
    const getDates = (weekNumber) => {
      const startDate = getStartOfWeekDate(weekNumber);
      const endDate = getEndOfWeekDate(weekNumber);
      return {
        start: startDate.toLocaleDateString(),
        end: endDate.toLocaleDateString()
      };
    };

  const validExpenditures = expenditure.filter(
    (exp) => exp && exp.date && exp.amount
  );

  const chartData = validExpenditures.map((exp) => ({
    x: `${getDates(exp.date).start} - \n${getDates(exp.date).end}`,
    y: exp.amount,
  })
);

  return (
    <div>
      <h1>Chart</h1>
      {/* <p>Az adott hét intervalluma: {getDates(weekNumber).start} - {getDates(weekNumber).end}</p> */}
      <div className="chart-cointainer">
        <VictoryChart domainPadding={{ x: 20 }} theme={VictoryTheme.clean}>
          {/* X tengely felirat */}
          <VictoryAxis
            label="Week"
            style={{
              axisLabel: { fontSize: 10, padding: 35 },
              tickLabels: { fontSize: 10, padding: 5 },
            }}
          />
          {/* Y tengely felirat (, helyett lehet . kell, később visszatérünk rá.)*/}
          <VictoryAxis
            dependentAxis
            label={`Amount (${currency || "HUF"})`}
            style={{
              axisLabel: { fontSize: 14, padding: 50 },
              tickLabels: { fontSize: 10, padding: 5 },
            }}
          />
          {/* Adatok*/}
          <VictoryBar
            data={(chartData)}
            labels={({ datum }) => `${datum.y}`}
            style={{
              data: { fill: "#c43a31" },
              labels: { fontSize: 10 },
            }}
          />
        </VictoryChart>
      </div>
    </div>
  );
}
