import React from "react";
import styles from "./ResultsChart.module.css";

const ResultsChart = ({ options, totalVotes }) => {
  // Find the maximum votes to normalize bar heights for accurate proportional display
  const maxVotes = Math.max(...options.map((option) => option.votes), 1);

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.voteDistributionTitle}>Vote Distribution</h3>

      <div className={styles.barChart}>
        {options.map((option) => {
          // Calculate percentage for display
          const percentage =
            totalVotes === 0 ? 0 : (option.votes / totalVotes) * 100;

          // Calculate bar height relative to the maximum votes for accurate visual representation
          // This ensures that bars with equal votes have equal heights
          const barHeight =
            totalVotes === 0 ? 0 : (option.votes / maxVotes) * 100;

          return (
            <div key={option._id} className={styles.barWrapper}>
              <div className={styles.barContainer}>
                <div
                  className={styles.bar}
                  style={{ height: `${barHeight}%` }}
                  title={`${option.option}: ${option.votes} votes (${Math.round(
                    percentage
                  )}%)`}
                ></div>
                {/* Show percentage on top of each bar */}
                {percentage > 0 && (
                  <span className={styles.barPercentage}>
                    {Math.round(percentage)}%
                  </span>
                )}
              </div>
              <span className={styles.barLabel}>{option.option}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsChart;
