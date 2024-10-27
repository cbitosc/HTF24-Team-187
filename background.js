// // Listen for completed web requests
chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        const url = new URL(tab.url);
        const sslScore = await checkSSL(url.hostname);
        const reputationScore = await fetchDomainReputation(url.hostname);
        
        // Combine SSL score and domain reputation to create a final score
        const trustworthinessScore = calculateTrustworthinessScore(sslScore, reputationScore);
        
        // Store the trustworthiness score in chrome storage
        chrome.storage.local.set({ trustworthinessScore });
        
        console.log(`Trustworthiness Score for ${url.hostname}: ${trustworthinessScore}`);
    }
});

// Function to check SSL certificate
async function checkSSL(domain) {
    const url = `https://api.ssllabs.com/api/v3/analyze?host=${domain}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching SSL data: ${response.statusText}`);
            return 0; // Resolve with 0 on error
        }

        const result = await response.json();
        if (result.endpoints && result.endpoints.length > 0) {
            const score = result.endpoints[0].grade; // A, B, C, D, F
            return sslScoreToNumeric(score);
        } else {
            console.error("No endpoints available in SSL data.");
            return 0;
        }
    } catch (error) {
        console.error("Error fetching SSL data:", error);
        return 0;
    }
}

// Function to convert SSL grades to numeric scores
function sslScoreToNumeric(grade) {
    switch (grade) {
        case 'A':
            return 100;
        case 'A-':
            return 90;
        case 'B':
            return 80;
        case 'C':
            return 70;
        case 'D':
            return 50;
        case 'F':
            return 0;
        default:
            return 0;
    }
}

// Function to fetch domain reputation from VirusTotal API
async function fetchDomainReputation(domain) {
    const apiKey = '45aef5dde8294e146f0d562b12903331509c5096430aa599428e0e2d66c0d37e'; // Replace with your VirusTotal API key
    const url = `https://www.virustotal.com/vtapi/v2/domain/report?apikey=${apiKey}&domain=${domain}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching domain reputation: ${response.statusText}`);
            return 0;
        }

        const result = await response.json();
        return calculateReputationScore(result);
    } catch (error) {
        console.error("Error fetching domain reputation:", error);
        return 0;
    }
}

// Function to calculate a numeric score based on VirusTotal response
function calculateReputationScore(result) {
    const positiveVotes = result.positives || 0;
    const totalVotes = result.total || 1; // Avoid division by zero
    return Math.round((positiveVotes / totalVotes) * 100); // Convert to a percentage
}

// Function to calculate trustworthiness score
function calculateTrustworthinessScore(sslScore, reputationScore) {
    return Math.round((sslScore + reputationScore) / 2); // Average of both scores
}

  // Replace with your Google Safe Browsing API key

// async function getDomainAge(domain) {
//     try {
//         const response = await fetch(`https://api.whoisxmlapi.com/v1/whois?apiKey=YOUR_WHOIS_API_KEY&domainName=${domain}`);
//         const data = await response.json();
        
//         let creationDate = new Date(data.WhoisRecord.createdDate);
//         let domainAgeDays = (new Date() - creationDate) / (1000 * 60 * 60 * 24);
        
//         console.log(`Domain Age (days): ${domainAgeDays}`);
//         return domainAgeDays > 730 ? 1.0 : domainAgeDays / 730.0;
//     } catch (error) {
//         console.error("Error checking domain age:", error);
//         return 0.0;
//     }
// }

// async function checkVirusTotal(domain, apiKey) {
//     try {
//         const response = await fetch(`https://www.virustotal.com/api/v3/domains/${domain}`, {
//             headers: { 'x-apikey': apiKey }
//         });
//         const data = await response.json();

//         let reputation = data.data.attributes.reputation || 0;
//         console.log(`VirusTotal Reputation: ${reputation}`);
//         return Math.max(0.0, Math.min((reputation + 100) / 200.0, 1.0));
//     } catch (error) {
//         console.error("Error checking VirusTotal:", error);
//         return 0.0;
//     }
// }

// async function checkGoogleSafeBrowsing(apiKey, url) {
//     try {
//         const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
//             method: 'POST',
//             body: JSON.stringify({
//                 client: { clientId: "trustworthiness_extension", clientVersion: "1.0" },
//                 threatInfo: {
//                     threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
//                     platformTypes: ["ANY_PLATFORM"],
//                     threatEntryTypes: ["URL"],
//                     threatEntries: [{ url }]
//                 }
//             })
//         });
//         const data = await response.json();

//         const isSafe = data.matches ? false : true;
//         console.log(`Google Safe Browsing Result: ${isSafe ? "Safe" : "Not Safe"}`);
//         return isSafe ? 1.0 : 0.0;
//     } catch (error) {
//         console.error("Error checking Google Safe Browsing:", error);
//         return 0.0;
//     }
// }

// async function calculateTrustworthinessScore(domain) {
//     const WHOIS_API_KEY = "qLokT8HpsD49hmYgljsnPvcKifzILrZ0";
//     const VIRUSTOTAL_API_KEY = "2877d1a302aee661ea74cd0255252f52e1c9b2476ac2bab68d3daa6fbe7e6a90";
//     const GOOGLE_SAFE_BROWSING_API_KEY = "AIzaSyC28UjGO2fX-V948y96LfWGROJxzsRyhW4";
    
//     const domainAgeScore = await getDomainAge(domain, WHOIS_API_KEY);
//     const virusTotalScore = await checkVirusTotal(domain, VIRUSTOTAL_API_KEY);
//     const googleSafeBrowsingScore = await checkGoogleSafeBrowsing(GOOGLE_SAFE_BROWSING_API_KEY, `http://${domain}`);

//     const domainAgeWeight = 0.4;
//     const virusTotalWeight = 0.4;
//     const googleSafeBrowsingWeight = 0.2;

//     const finalScore = (
//         domainAgeScore * domainAgeWeight +
//         virusTotalScore * virusTotalWeight +
//         googleSafeBrowsingScore * googleSafeBrowsingWeight
//     );

//     console.log(`Trustworthiness Score for ${domain}: ${finalScore.toFixed(2)}`);
//     return finalScore;
// }

// chrome.webRequest.onCompleted.addListener(
//     async function (details) {
//         const url = new URL(details.url);
//         const score = await calculateTrustworthinessScore(url.hostname);
        
//         chrome.storage.local.set({ [`score_${url.hostname}`]: score });
//     },
//     { urls: ["<all_urls>"] }
// );
