import React from "react";
import styles from "./ResultsChart.module.css";

const ResultsChart = ({ options, totalVotes }) => {
  // Find the maximum votes to normalize bar heights for accurate proportional display
  const maxVotes = Math.max(...options.map((option) => option.votes), 1);

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.voteDistributionTitle}>Vote Distribution</h3>

      <div className={styles.barChart} data-option-count={options.length}>
        {options.map((option) => {
          // Calculate percentage for display
          const percentage =
            totalVotes === 0 ? 0 : (option.votes / totalVotes) * 100;

          // Calculate bar height relative to the maximum votes for accurate visual representation
          // This ensures that bars with equal votes have equal heights
          const barHeight =
            totalVotes === 0 ? 0 : (option.votes / maxVotes) * 100;

          const hasVotes = option.votes > 0;

          return (
            <div key={option._id} className={styles.barWrapper}>
              <div className={styles.barContainer}>
                <div
                  className={`${styles.bar} ${
                    !hasVotes ? styles.zeroVotes : ""
                  }`}
                  style={{ height: `${Math.max(barHeight, 4)}%` }} // Minimum 4% height for visibility
                  title={`${option.option}: ${option.votes} votes (${Math.round(
                    percentage
                  )}%)`}
                ></div>
                {/* Always show percentage, even for 0 votes */}
                <span
                  className={`${styles.barPercentage} ${
                    !hasVotes ? styles.zeroVotes : ""
                  }`}
                >
                  {Math.round(percentage)}%
                </span>
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
