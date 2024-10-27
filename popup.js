// document.addEventListener('DOMContentLoaded', function () {
//   // Fetch the score from local storage or set a default
//   chrome.storage.local.get(['trustworthinessScore'], function(result) {
//       const scoreElement = document.getElementById('score');
//       const explanationElement = document.getElementById('explanation');
      
//       if (result.trustworthinessScore) {
//           scoreElement.textContent = result.trustworthinessScore;
//           explanationElement.textContent = getScoreExplanation(result.trustworthinessScore);
//       } else {
//           scoreElement.textContent = "N/A";
//           explanationElement.textContent = "No score available.";
//       }
//   });
// });

// function getScoreExplanation(score) {
//   if (score < 40) {
//       return "Low Trustworthiness: This site may be untrustworthy.";
//   } else if (score < 70) {
//       return "Medium Trustworthiness: Proceed with caution.";
//   } else {
//       return "High Trustworthiness: This site is likely reliable.";
//   }
// }

document.addEventListener("DOMContentLoaded", async () => {
  chrome.storage.local.get("trustworthinessScore", (data) => {
      document.getElementById("score").textContent = `Score: ${data.trustworthinessScore}`;
  });
});
