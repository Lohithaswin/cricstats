// Loading indicator functions
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function showStatus(message, isError = false) {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status-message ${isError ? 'error' : 'success'}`;
        statusElement.style.display = 'block';
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const playerForm = document.getElementById("playerForm");
    const playerRankings = document.getElementById("playerRankings");
    const matchForm = document.getElementById("matchForm");
    const playerStatsRows = document.getElementById('playerStatsRows');
    const saveMatch = document.getElementById('saveMatch');
    const recentMatchesList = document.getElementById('recentMatchesList');
    const addPlayerRow = document.getElementById('addPlayerRow'); // Added missing declaration
    const undoLastEntry = document.getElementById('undoLastEntry');
    document.querySelector('a[href="#playerCards"]').addEventListener('click', function() {
        updatePlayerCards();
    });
// Call this after initial setup
initializeRealTimeUpdates();
createMatchButtons();
// Call this in your DOMContentLoaded
initializePlayerAnalysis();
setupPlayerStatsContainer();
    // Tab Navigation
    const ADMIN_PASSWORD = "cricket123";
    document.querySelectorAll("nav ul li a").forEach(tab => {
        tab.addEventListener("click", function (e) {
            e.preventDefault();
            const targetTab = this.getAttribute("href");
            const currentActiveTab = document.querySelector(".tab-content.active");
            
            // Reset tabs if clicking the already active tab
            if (this.classList.contains("active")) return;
    
            // Handle admin panel access
            if (targetTab === "#adminPanel") {
                const password = prompt("Enter admin password:");
                if (password === null || password !== ADMIN_PASSWORD) {
                    switchTab('#leaderboard');

                    if (password !== null) showStatus("Invalid password!", true);
                    this.classList.remove("active");
                    currentActiveTab.classList.add("active");
                    return;
                }
            }
         
            document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
            document.querySelector(this.getAttribute("href")).classList.add("active");
            document.querySelectorAll("nav ul li a").forEach(tab => tab.classList.remove("active"));
            this.classList.add("active");
        });
    });
    let performanceChart = null;
    let currentTab = '#leaderboard'; // Default tab

function switchTab(targetTab) {
    document.querySelectorAll(".tab-content").forEach(content => 
        content.classList.remove("active"));
    document.querySelector(targetTab).classList.add("active");
    
    document.querySelectorAll("nav ul li a").forEach(tab => 
        tab.classList.remove("active"));
    document.querySelector(`nav ul li a[href="${targetTab}"]`).classList.add("active");
    
    currentTab = targetTab;
}
document.getElementById('analysisType').addEventListener('change', function() {
    const analysisType = this.value;
    const topPerformers = document.getElementById('topPerformers');
    const individualAnalysis = document.getElementById('individualAnalysis');
    const aiPrediction = document.getElementById('aiPrediction');

    // Hide all sections first
    topPerformers.style.display = 'none';
        individualAnalysis.style.display = 'none';
    aiPrediction.style.display = 'none';

    // Show the selected section
    if (analysisType === 'runs' || analysisType === 'wickets') {
        topPerformers.style.display = 'block';
        showTopPerformers(analysisType);
    } else if (analysisType === 'individual') {
        individualAnalysis.style.display = 'block';
    } else if (analysisType === 'ai-prediction') {
        aiPrediction.style.display = 'block';
        // Initialize AI prediction
        initializeAIPrediction();
    }
});
function showTopPerformers(type) {
    db.ref("players").orderByChild(type === 'runs' ? 'runs' : 'wickets')
      .limitToLast(5)
      .once("value", snapshot => {
          const players = [];
          snapshot.forEach(child => {
              players.push(child.val());
          });
          
          // Reverse to get descending order
          players.reverse();
          
          // Generate table HTML
          const tableHTML = `
              <table class="performance-table">
                  <thead>
                      <tr>
                          <th>Rank</th>
                          <th>Player</th>
                          <th>${type === 'runs' ? 'Runs' : 'Wickets'}</th>
                          <th>Matches</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${players.map((player, index) => `
                          <tr>
                              <td>${index + 1}</td>
                              <td>${player.name}</td>
                              <td>${type === 'runs' ? player.runs : player.wickets}</td>
                              <td>${player.matchesPlayed}</td>
                          </tr>
                      `).join('')}
                  </tbody>
              </table>
          `;
          
          document.getElementById('topPerformers').innerHTML = tableHTML;
      });
}

function tryAccessAdminPanel() {
    const password = prompt("Enter admin password:");
    if (password === ADMIN_PASSWORD) {
        switchTab('#adminPanel');
    } else {
        alert(password === null ? "Access cancelled." : "Invalid password!");
        switchTab('#leaderboard');
        // Ensure the admin tab is not visually active
        document.querySelector('nav ul li a[href="#adminPanel"]').classList.remove("active");
    }
}

document.querySelectorAll("nav ul li a").forEach(tab => {
    tab.addEventListener("click", function (e) {
        e.preventDefault();
        const targetTab = this.getAttribute("href");
        
        if (targetTab === "#adminPanel") {
            tryAccessAdminPanel();
        } else {
            switchTab(targetTab);
        }
        if (this.getAttribute("href") === "#playerCards") {
            updatePlayerCards();
        }
    });
});

// Initial tab setup
switchTab(currentTab);

    function createMatchButtons() {
        // Remove existing buttons if any
        const existingButtons = document.querySelector('.match-state-buttons');
        if (existingButtons) {
            existingButtons.remove();
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'match-state-buttons';
        buttonContainer.innerHTML = `
            <button id="createNewMatch" class="primary-button">Create New Match</button>
            <button id="editMatch" class="secondary-button" disabled>Edit Match</button>
        `;

        // Insert before the match-details div
        const matchSetupForm = document.querySelector('.match-setup-form');
        const matchDetails = document.querySelector('.match-details');
        matchSetupForm.insertBefore(buttonContainer, matchDetails);

        // Event listeners for the buttons
        document.getElementById('createNewMatch').addEventListener('click', () => {
            clearMatchForm();
            document.getElementById('matchId').value = ''; // Clear match ID
            document.querySelector('.match-setup-form').classList.add('active');
            document.getElementById('editMatch').disabled = true;
            showStatus('Creating new match');
        });

        document.getElementById('editMatch').addEventListener('click', () => {
            const selectedMatch = document.querySelector('.match-card.selected');
            if (selectedMatch) {
                const matchId = selectedMatch.dataset.matchId;
                loadMatchForEdit(matchId);
            } else {
                showStatus('Please select a match to edit', true);
            }
        });
    }

    
    async function loadMatchForEdit(matchId) {
        if (!matchId) {
            showStatus('Invalid match ID', true);
            return;
        }
    
        try {
            const snapshot = await db.ref(`matches/${matchId}`).once('value');
            const match = snapshot.val();
            
            if (!match) {
                showStatus('Match not found', true);
                return;
            }
    
            clearMatchForm(); // Resets the form properly
            setupPlayerStatsContainer(); // Ensures player sections exist before appending players
    
            document.getElementById('matchId').value = matchId;
            document.getElementById('matchTitle').value = match.title || '';
            document.getElementById('matchTeam1').value = match.team1 || '';
            document.getElementById('matchTeam2').value = match.team2 || '';
            document.getElementById('matchDate').value = match.date || '';
            document.getElementById('winningTeam').value = match.winner || '';
    
            if (match.playerStats && Array.isArray(match.playerStats)) {
                match.playerStats.forEach(player => {
                    const row = createPlayerStatsRow(player.team);
                    const inputs = row.querySelectorAll('input');
                    const inningsTypeSelect = row.querySelector('select.innings-type-select');
                    const predictionDisplay = row.querySelector('.prediction-display');
                    
                    inputs[0].value = player.name || '';
                    inputs[1].value = player.runs || 0;
                    inputs[2].checked = player.notOut || false;
                    inputs[3].value = player.wickets || 0;
                    inputs[4].value = player.bonus || 0;
                    
                    if (inningsTypeSelect && player.inningsType) {
                        inningsTypeSelect.value = player.inningsType;
                    }

                    // Display stored predictions if they exist
                    if (player.predictedSixes !== undefined && player.predictedStrikeRate !== undefined) {
                        predictionDisplay.style.display = 'block';
                        predictionDisplay.querySelector('.predicted-sixes').textContent = player.predictedSixes;
                        predictionDisplay.querySelector('.predicted-sr').textContent = player.predictedStrikeRate;
                    }
                    
                    document.getElementById(`team${player.team}Players`).appendChild(row);
                });
            }
    
            document.querySelector('.match-setup-form').classList.add('active');
            showStatus('Match loaded for editing');
        } catch (error) {
            console.error('Error loading match:', error);
            showStatus('Error loading match: ' + error.message, true);
        }
    }
    
    
    
  // Update the calculatePoints function to handle edge cases
  function calculatePoints(runs, wickets, matchesPlayed, innings, notOuts, bonus = 0) {
    if (matchesPlayed === 0) return 0;
    
    // Effective innings calculation accounting for not-outs
    const effectiveInnings = Math.max(innings - notOuts, 1);
    const avgRuns = runs / effectiveInnings;
    const avgWickets = wickets / matchesPlayed;

    let points = (runs * 1) + (wickets * 10); // Base points without bonus

    // Bonus points for batting average
    if (avgRuns > 50) points += 50;
    else if (avgRuns > 40) points += 30;
    else if (avgRuns > 30) points += 15;

    // Bonus points for bowling average
    if (avgWickets > 3) points += 30;
    else if (avgWickets > 2) points += 20;
    else if (avgWickets > 1) points += 10;

    // Add catch/run-out bonus only if specified and valid
   
        points += bonus;
    

    return Math.round(points);
}

    
    // Add this function to properly handle player stats updates
    // Update the playerRef.transaction in updatePlayerStats function
    async function updatePlayerStats(playerData, oldStats = null, isEditing = false, previousWinner = null, newWinner = null) {
        return db.ref(`players/${playerData.name}`).transaction(player => {
            // Case 1: New player being added (either in new match or during edit)
            if (player === null) {
                return {
                    name: playerData.name,
                    runs: playerData.runs || 0,
                    wickets: playerData.wickets || 0,
                    matchesPlayed: 1, // Always start with 1 match
                    innings: 1,
                    notOuts: playerData.notOut ? 1 : 0,
                    wins: playerData.isWinner ? 1 : 0,
                    losses: playerData.isWinner === false ? 1 : 0,
                    winPercentage: playerData.isWinner ? 100 : 0,
                    bonusPoints: playerData.bonus || 0,
                    predictedSixes: playerData.predictedSixes || 0,
                    predictedStrikeRate: playerData.predictedStrikeRate || 0,
                    points: calculatePoints(
                        playerData.runs || 0,
                        playerData.wickets || 0,
                        1,
                        1,
                        playerData.notOut ? 1 : 0,
                        playerData.bonus || 0
                    )
                };
            }
            
            // Case 2: Existing player
            if (player) {
                let newRuns = player.runs || 0;
                let newWickets = player.wickets || 0;
                let totalMatches = player.matchesPlayed || 0;
                let totalInnings = player.innings || totalMatches;
                let totalNotOuts = player.notOuts || 0;
                let wins = player.wins || 0;
                let losses = player.losses || 0;
                let bonusPoints = player.bonusPoints || 0;
                let predictedSixes = player.predictedSixes || 0;
                let avgStrikeRate = player.predictedStrikeRate || 0;

                if (isEditing && oldStats) {
                    // Remove old stats if player was in the match before
                    newRuns = Math.max(0, newRuns - (oldStats.runs || 0));
                    newWickets = Math.max(0, newWickets - (oldStats.wickets || 0));
                    bonusPoints = Math.max(0, bonusPoints - (oldStats.bonus || 0));
                    predictedSixes = Math.max(0, predictedSixes - (oldStats.predictedSixes || 0));
                    // For editing, we need to recalculate the average
                    avgStrikeRate = (avgStrikeRate * totalInnings - (oldStats.predictedStrikeRate || 0)) / Math.max(1, totalInnings - 1);
                    if (oldStats.notOut) {
                        totalNotOuts = Math.max(0, totalNotOuts - 1);
                    }
    
                    // Handle win/loss adjustment
                    if (oldStats.isWinner === true) {
                        wins = Math.max(0, wins - 1);
                    } else if (oldStats.isWinner === false) {
                        losses = Math.max(0, losses - 1);
                    }
                } else if (!isEditing || !oldStats) {
                    // New player added during edit or new match
                    totalMatches++;
                    totalInnings++;
                }
    
                // Add new stats
                newRuns += playerData.runs || 0;
                newWickets += playerData.wickets || 0;
                bonusPoints += playerData.bonus || 0;
                predictedSixes += playerData.predictedSixes || 0;
                // Calculate new average strike rate
                avgStrikeRate = ((avgStrikeRate * (totalInnings - 1)) + (playerData.predictedStrikeRate || 0)) / totalInnings;
                
                if (playerData.notOut) {
                    totalNotOuts++;
                }
    
                // Update wins/losses for the new state
                if (playerData.isWinner) {
                    wins++;
                } else if (playerData.isWinner === false) {
                    losses++;
                }
    
                const winPercentage = totalMatches > 0 ? 
                    ((wins / totalMatches) * 100) : 0;
    
                return {
                    ...player,
                    name: playerData.name,
                    runs: newRuns,
                    wickets: newWickets,
                    matchesPlayed: totalMatches,
                    innings: totalInnings,
                    notOuts: totalNotOuts,
                    wins: wins,
                    losses: losses,
                    winPercentage: parseFloat(winPercentage.toFixed(2)),
                    bonusPoints: bonusPoints,
                    predictedSixes: predictedSixes,
                    predictedStrikeRate: avgStrikeRate,
                    points: calculatePoints(
                        newRuns,
                        newWickets,
                        totalMatches,
                        totalInnings,
                        totalNotOuts,
                        bonusPoints
                    )
                };
            }
            return null;
        });
    }


    
    
    
    // Show Loading
    function showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    // Hide Loading
    function hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    // Show Status Message
    function showStatus(message, isError = false) {
        const statusElement = document.getElementById('statusMessage');
        statusElement.textContent = message;
        statusElement.className = `status-message ${isError ? 'error' : 'success'}`;
        statusElement.style.display = 'block';
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);
    }
    function renderLeaderboard(players) {
        playerRankings.innerHTML = "";
        let highestRunScorer = null;
        let highestWicketTaker = null;
        
        // Find the top players for orange and purple caps
        if (players.length > 0) {
            highestRunScorer = players.reduce((prev, current) => (current.runs > prev.runs ? current : prev));
            highestWicketTaker = players.reduce((prev, current) => (current.wickets > prev.wickets ? current : prev));
        }
    
        players.forEach((player, index) => {
            let movement = "";
            if (player.previousRank !== undefined) {
                if (player.previousRank > index + 1) {
                    movement = "📈"; // Moved up
                } else if (player.previousRank < index + 1) {
                    movement = "📉"; // Moved down
                }
            }
            
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1} ${movement}</td>
                <td class="player-name">
                    ${player.name}
                    ${player.name === highestRunScorer?.name ? `<img src="orange_cap.png" class="cap-icon" title="Highest Run Scorer">` : ""}
                    ${player.name === highestWicketTaker?.name ? `<img src="purple_cap.png" class="cap-icon" title="Highest Wicket Taker">` : ""}
                </td>
                <td>${player.matchesPlayed}</td>
                <td>${player.runs}</td>
                <td>${player.wickets}</td>
                <td>${player.points}</td>
            `;
            playerRankings.appendChild(row);
    
            // Store previous rank for the next update
            player.previousRank = index + 1;
        });
    }
    
    
    function showPlayerDetails(playerName) {
        // Switch to player details tab
        document.querySelectorAll(".tab-content").forEach(content => 
            content.classList.remove("active"));
        document.getElementById("playerDetails").classList.add("active");
        
        // Update navigation
        document.querySelectorAll("nav ul li a").forEach(tab => 
            tab.classList.remove("active"));
            
        // Load and display player details
        loadPlayerDetails(playerName);
    }
    async function loadPlayerDetails(playerName) {
        showLoading();
        try {
            // Fetch player's basic stats
            const playerSnapshot = await db.ref(`players/${playerName}`).once('value');
            const playerData = playerSnapshot.val();
    
            // Calculate averages
            const avgRuns = (playerData.runs / playerData.matchesPlayed).toFixed(2);
            const avgWickets = (playerData.wickets / playerData.matchesPlayed).toFixed(2);
    
            // Update the stats display
            document.querySelector('.player-name-header').textContent = playerData.name;
            document.querySelector('.stat-value.matches').textContent = playerData.matchesPlayed;
            document.querySelector('.stat-value.runs').textContent = playerData.runs;
            document.querySelector('.stat-value.wickets').textContent = playerData.wickets;
            document.querySelector('.stat-value.avg-runs').textContent = avgRuns;
            document.querySelector('.stat-value.avg-wickets').textContent = avgWickets;
            document.querySelector('.stat-value.points').textContent = playerData.points;
    
            // Fetch last 5 matches
            const matchesSnapshot = await db.ref('matches')
                .orderByChild('timestamp')
                .limitToLast(5)
                .once('value');
    
            const matchHistory = [];
            matchesSnapshot.forEach(matchSnap => {
                const match = matchSnap.val();
                const playerStats = match.playerStats?.find(p => p.name === playerName);
                if (playerStats) {
                    matchHistory.push({
                        date: new Date(match.date).toLocaleDateString(),
                        runs: playerStats.runs || 0,
                        wickets: playerStats.wickets || 0
                    });
                }
            });
    
         
    
        } catch (error) {
            console.error('Error loading player details:', error);
            showStatus('Error loading player statistics', true);
        } finally {
            hideLoading();
        }
    }
    
    async function showPlayerStats(playerName) {
        showLoading();
        try {
            // Fetch player data
            const playerSnapshot = await db.ref(`players/${playerName}`).once('value');
            const playerData = playerSnapshot.val();
            
            // Fetch last 5 matches
            const matchesSnapshot = await db.ref('matches')
                .orderByChild('timestamp')
                .limitToLast(5)
                .once('value');
                
            const matchHistory = [];
            matchesSnapshot.forEach(matchSnap => {
                const match = matchSnap.val();
                const playerStats = match.playerStats?.find(p => p.name === playerName);
                if (playerStats) {
                    matchHistory.push({
                        date: new Date(match.timestamp).toLocaleDateString(),
                        runs: playerStats.runs,
                        wickets: playerStats.wickets
                    });
                }
            });
    
            // Calculate averages
            const avgRuns = (playerData.runs / playerData.matchesPlayed).toFixed(2);
            const avgWickets = (playerData.wickets / playerData.matchesPlayed).toFixed(2);
    
            // Create and show stats modal
            const modal = document.createElement('div');
            modal.className = 'player-history-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>${playerName}'s Statistics</h2>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">Matches</span>
                            <span class="stat-value">${playerData.matchesPlayed}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total Runs</span>
                            <span class="stat-value">${playerData.runs}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Average Runs</span>
                            <span class="stat-value">${avgRuns}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total Wickets</span>
                            <span class="stat-value">${playerData.wickets}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Average Wickets</span>
                            <span class="stat-value">${avgWickets}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Points</span>
                            <span class="stat-value">${playerData.points}</span>
                        </div>
                    </div>
                    <div class="performance-chart">
                        <h3>Last 5 Matches Performance</h3>
                        <canvas id="performanceChart"></canvas>
                    </div>
                </div>
            `;
    
            document.body.appendChild(modal);
    
            // Create performance chart
            const ctx = document.getElementById('performanceChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: matchHistory.map(m => m.date),
                    datasets: [{
                        label: 'Runs',
                        data: matchHistory.map(m => m.runs),
                        borderColor: '#1e88e5',
                        fill: false
                    }, {
                        label: 'Wickets',
                        data: matchHistory.map(m => m.wickets),
                        borderColor: '#43a047',
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
    
            // Close modal functionality
            modal.querySelector('.close').onclick = () => modal.remove();
            window.onclick = (event) => {
                if (event.target === modal) modal.remove();
            };
        } catch (error) {
            console.error('Error loading player stats:', error);
            showStatus('Error loading player statistics', true);
        } finally {
            hideLoading();
        }
    }
    
    // Update Leaderboard
    function updateLeaderboard() {
        showLoading();
        db.ref("players").once("value")
            .then(snapshot => {
                const players = [];
                snapshot.forEach(childSnapshot => {
                    players.push(childSnapshot.val());
                });

                players.sort((a, b) => b.points - a.points);
                playerRankings.innerHTML = "";

                if (players.length === 0) {
                    const row = document.createElement("tr");
                    row.innerHTML = '<td colspan="6" style="text-align: center;">No players found</td>';
                    playerRankings.appendChild(row);
                    return;
                }

                players.forEach((player, index) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${player.name}</td>
                        <td>${player.matchesPlayed || 0}</td> <!-- Use matchesPlayed -->
                        <td>${player.runs || 0}</td>
                        <td>${player.wickets || 0}</td>
                        <td>${player.points || 0}</td>
                    `;
                    playerRankings.appendChild(row);
                });
            })
            .catch(error => {
                console.error("Error updating leaderboard:", error);
                showStatus('Error updating leaderboard', true);
            })
            .finally(() => hideLoading());
    }

    // Handle Player Stats Submission
    playerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        showLoading();

        const name = document.getElementById("playerName").value.trim();
        const runs = parseInt(document.getElementById("runs").value);
        const wickets = parseInt(document.getElementById("wickets").value);
        const matchesPlayed = parseInt(document.getElementById("matches").value);

        if (!name || isNaN(runs) || isNaN(wickets) || isNaN(matchesPlayed) || 
            runs < 0 || wickets < 0 || matchesPlayed < 1) {
            hideLoading();
            showStatus('Please enter valid player details.', true);
            return;
        }

        const playerRef = db.ref(`players/${name}`);
        playerRef.transaction(player => {
            if (player === null) {
                return {
                    name,
                    runs,
                    wickets,
                    matchesPlayed,
                    points: calculatePoints(runs, wickets, matchesPlayed)
                };
            } else {
                const newRuns = player.runs + runs;
                const newWickets = player.wickets + wickets;
                const newMatches = player.matchesPlayed + matchesPlayed;
                return {
                    name,
                    runs: newRuns,
                    wickets: newWickets,
                    matchesPlayed: newMatches,
                    points: calculatePoints(newRuns, newWickets, newMatches)
                };
            }
        }).then(() => {
            hideLoading();
            showStatus('Player stats updated successfully!');
            playerForm.reset();
            updateLeaderboard();
        }).catch(error => {
            hideLoading();
            showStatus('Error updating player stats: ' + error.message, true);
        });
    });

    // Handle Match Submission
    matchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        showLoading();

        const team1 = document.getElementById("team1").value.trim();
        const team1Score = parseInt(document.getElementById("team1Score").value);
        const team2 = document.getElementById("team2").value.trim();
        const team2Score = parseInt(document.getElementById("team2Score").value);

        if (!team1 || !team2 || isNaN(team1Score) || isNaN(team2Score) || 
            team1Score < 0 || team2Score < 0) {
            hideLoading();
            showStatus('Please enter valid match details.', true);
            return;
        }

        const winner = team1Score > team2Score ? team1 : (team1Score < team2Score ? team2 : "Draw");
        const matchData = {
            team1,
            team1Score,
            team2,
            team2Score,
            winner,
            timestamp: Date.now()
        };

        db.ref("matches").push(matchData)
        .then(() => {
            hideLoading();
            showStatus('Match recorded successfully!');
            matchForm.reset();
            loadRecentMatches();  // Force refresh match list
        })
    
            .catch(error => {
                hideLoading();
                showStatus('Error recording match: ' + error.message, true);
            });
    });

    // Update Match History
    db.ref("matches").on("value", snapshot => {
        console.log("Database updated:", snapshot.val()); // Debugging log
        loadRecentMatches();  // Ensure real-time updates happen
    });
    

    // Set up real-time leaderboard updates
    db.ref("players").on("child_changed", () => {
        updateLeaderboard();
    });

    db.ref("players").on("child_added", () => {
        updateLeaderboard();
    });

    // Initial leaderboard load
    updateLeaderboard();

   

    let playerEntries = [];

   
    function createPlayerStatsRow(teamNumber) {
        const row = document.createElement("div");
        row.className = "player-stats-row";
        row.innerHTML = `
            <div class="team-indicator">Team ${teamNumber}
                <input type="text" placeholder="Player Name">
                <input type="number" class="runs-input" placeholder="Runs" min="0">
                <select class="innings-type-select">
                    <option value="aggressive">Aggressive</option>
                    <option value="balanced">Balanced</option>
                    <option value="defensive">Defensive</option>
                </select>
            <input type="checkbox" title="Not Out">
            <input type="number" placeholder="Wickets" min="0">
                <input type="number" placeholder="Catch / Run out Bonus" min="0" max="5">
                <div class="prediction-display" style="display: none;">
                    <span>Predicted: </span>
                    <span class="predicted-sixes">-</span> sixes,
                    <span class="predicted-sr">-</span> SR
                </div>
                <button class="remove-player" type="button">×</button>
            </div>
        `;

        const runsInput = row.querySelector('.runs-input');
        const inningsType = row.querySelector('.innings-type-select');
        const predictionDisplay = row.querySelector('.prediction-display');

        let lastRuns = 0;
        let lastInningsType = 'balanced';

        async function updatePrediction() {
            const currentRuns = parseInt(runsInput.value) || 0;
            const currentInningsType = inningsType.value;

            // Only update if runs or innings type has changed
            if (currentRuns !== lastRuns || currentInningsType !== lastInningsType) {
                const prediction = await makePrediction(currentRuns, currentInningsType);
                if (prediction) {
                    predictionDisplay.style.display = 'block';
                    predictionDisplay.querySelector('.predicted-sixes').textContent = prediction.predictedSixes;
                    predictionDisplay.querySelector('.predicted-sr').textContent = prediction.predictedStrikeRate;
                    
                    // Store the current values
                    lastRuns = currentRuns;
                    lastInningsType = currentInningsType;
                } else {
                    predictionDisplay.style.display = 'none';
                }
            }
        }

        runsInput.addEventListener('input', updatePrediction);
        inningsType.addEventListener('change', updatePrediction);
        
        // Update the remove player event listener to properly remove the row and its stats
        row.querySelector(".remove-player").addEventListener("click", async () => {
            const playerName = row.querySelector('input[type="text"]').value.trim();
            if (playerName) {
                const matchId = document.getElementById('matchId').value;
                if (matchId) {
                    try {
                        // Get the player's current stats from this match
                        const matchSnapshot = await db.ref(`matches/${matchId}`).once('value');
                        const match = matchSnapshot.val();
                        const playerStats = match.playerStats || [];
                        const playerStat = playerStats.find(stat => stat.name === playerName);

                        if (playerStat) {
                            // First subtract the stats from player's overall stats
                            await db.ref(`players/${playerName}`).transaction(player => {
                                if (player) {
                                    // Calculate new values, ensuring they don't go below 0
                                    const newRuns = Math.max(0, (player.runs || 0) - (playerStat.runs || 0));
                                    const newWickets = Math.max(0, (player.wickets || 0) - (playerStat.wickets || 0));
                                    const newMatchesPlayed = Math.max(0, (player.matchesPlayed || 0) - 1);
                                    const newInnings = Math.max(0, (player.innings || 0) - 1);
                                    const newNotOuts = Math.max(0, (player.notOuts || 0) - (playerStat.notOut ? 1 : 0));
                                    const newWins = Math.max(0, (player.wins || 0) - (playerStat.isWinner ? 1 : 0));
                                    const newLosses = Math.max(0, (player.losses || 0) - (playerStat.isWinner === false ? 1 : 0));
                                    const newBonusPoints = Math.max(0, (player.bonusPoints || 0) - (playerStat.bonus || 0));
                                    const newPredictedSixes = Math.max(0, (player.predictedSixes || 0) - (playerStat.predictedSixes || 0));
                                    const newPredictedStrikeRate = Math.max(0, (player.predictedStrikeRate || 0) - (playerStat.predictedStrikeRate || 0));

                                    // Calculate new win percentage
                                    const newWinPercentage = newMatchesPlayed > 0 ? 
                                        ((newWins / newMatchesPlayed) * 100) : 0;

                                    // Calculate new points
                                    const newPoints = calculatePoints(
                                        newRuns,
                                        newWickets,
                                        newMatchesPlayed,
                                        newInnings,
                                        newNotOuts,
                                        newBonusPoints
                                    );

                                    return {
                                        ...player,
                                        runs: newRuns,
                                        wickets: newWickets,
                                        matchesPlayed: newMatchesPlayed,
                                        innings: newInnings,
                                        notOuts: newNotOuts,
                                        wins: newWins,
                                        losses: newLosses,
                                        winPercentage: parseFloat(newWinPercentage.toFixed(2)),
                                        bonusPoints: newBonusPoints,
                                        predictedSixes: newPredictedSixes,
                                        predictedStrikeRate: newPredictedStrikeRate,
                                        points: newPoints
                                    };
                                }
                                return null;
                            });

                            // Then remove player from match stats
                            const updatedStats = playerStats.filter(stat => stat.name !== playerName);
                            await db.ref(`matches/${matchId}/playerStats`).set(updatedStats);

                            // Show success message
                            showStatus(`Removed ${playerName}'s stats successfully`);
                        }
                    } catch (error) {
                        console.error('Error removing player stats:', error);
                        showStatus('Error removing player stats', true);
                        return; // Don't remove the row if there was an error
                    }
                }
            }
            // Only remove the row after successful database updates
            row.remove();
        });

        return row;
    }
    document.querySelectorAll(".player-stats-row input[type='text']").forEach(input => {
        input.removeAttribute("disabled");
        input.readOnly = false;
    });
    
    function addTeamSection(teamNumber) {
        const teamSection = document.createElement("div");
        teamSection.className = "team-section";
        teamSection.innerHTML = `
            <h4>Team ${teamNumber} Players</h4>
            <div class="player-stats-rows" id="team${teamNumber}Players"></div>
            <button type="button" class="add-team-player secondary-button" data-team="${teamNumber}">
                + Add Team ${teamNumber} Player
            </button>
        `;
        return teamSection;
    }
    function setupPlayerStatsContainer() {
        const container = document.querySelector('.player-stats-container');
        container.innerHTML = `
            <h3>Player Statistics</h3>
            <div class="team-sections"></div>
            <div class="winner-selection">
                <label>Winner: </label>
                <select id="winningTeam">
                    <option value="">Select Winner</option>
                    <option value="1">Team 1</option>
                    <option value="2">Team 2</option>
                    <option value="draw">Draw</option>
                </select>
            </div>
        `;
    
        const teamSections = container.querySelector('.team-sections');
        teamSections.appendChild(addTeamSection(1));
        teamSections.appendChild(addTeamSection(2));
    
        // Add event listeners for team player buttons
        document.querySelectorAll('.add-team-player').forEach(button => {
            button.addEventListener('click', () => {
                const teamNumber = button.dataset.team;
                const teamPlayers = document.getElementById(`team${teamNumber}Players`);
                teamPlayers.appendChild(createPlayerStatsRow(teamNumber));
            });
        });
    
        // Add initial player row for each team
        document.querySelectorAll('.add-team-player').forEach(button => button.click());
    }
    
   

    addPlayerRow.addEventListener('click', () => {
        const row = createPlayerStatsRow();
        playerStatsRows.appendChild(row);
    });
    
    // Add initial player row
    addPlayerRow.click();


    function validateMatchDetails() {
        const matchTitle = document.getElementById('matchTitle').value.trim();
        const team1 = document.getElementById('matchTeam1').value.trim();
        const team2 = document.getElementById('matchTeam2').value.trim();
        const matchDate = document.getElementById('matchDate').value;

        if (!matchTitle || !team1 || !team2 || !matchDate) {
            showStatus('Please fill in all match details', true);
            return false;
        }
        return true;
    }
    

    function collectPlayerStats() {
        const stats = [];
        const winningTeam = document.getElementById('winningTeam').value;
        
        ['1', '2'].forEach(teamNum => {
            const teamRows = document.getElementById(`team${teamNum}Players`)
                .querySelectorAll('.player-stats-row');
            
            teamRows.forEach(row => {
                const inputs = row.querySelectorAll('input');
                const inningsTypeSelect = row.querySelector('select.innings-type-select');
                const predictionDisplay = row.querySelector('.prediction-display');
                const name = inputs[0].value.trim();
                if (name) {
                    const bonusValue = parseInt(inputs[4].value) || 0;
                    const bonus = bonusValue >= 0 && bonusValue <= 5 ? bonusValue : 0;
                    const runs = parseInt(inputs[1].value) || 0;
                    const inningsType = inningsTypeSelect ? inningsTypeSelect.value : 'balanced';
                    
                    // Get the predicted values from the display
                    const predictedSixes = parseInt(predictionDisplay.querySelector('.predicted-sixes').textContent) || 0;
                    const predictedStrikeRate = parseInt(predictionDisplay.querySelector('.predicted-sr').textContent) || 0;
                    
                    stats.push({
                        name,
                        runs,
                        notOut: inputs[2].checked,
                        wickets: parseInt(inputs[3].value) || 0,
                        bonus: bonus,
                        team: teamNum,
                        inningsType,
                        isWinner: winningTeam === 'draw' ? null : winningTeam === teamNum,
                        predictedSixes,
                        predictedStrikeRate: predictedStrikeRate / (runs > 0 ? 1 : 1) // Average SR per innings
                    });
                }
            });
        });
        
        return stats;
    }
    

   // Update the player stats adjustment in the saveMatch event listener
saveMatch.addEventListener('click', async () => {
    if (!validateMatchDetails()) return;
    if (!document.getElementById('winningTeam').value) {
        showStatus('Please select a winner', true);
        return;
    }
    
    showLoading();
    
    try {
        const matchId = document.getElementById('matchId').value;
        const isNewMatch = !matchId;
        
        let oldPlayerStats = {};
        let previousWinner = null;
        
        if (!isNewMatch) {
            const oldMatchSnapshot = await db.ref(`matches/${matchId}`).once('value');
            const oldMatch = oldMatchSnapshot.val();
            if (oldMatch && oldMatch.playerStats) {
                oldMatch.playerStats.forEach(stat => {
                    oldPlayerStats[stat.name] = {
                        ...stat,
                        matchId: matchId
                    };
                });
                previousWinner = oldMatch?.winner || null;
            }
        }

        const playerStats = collectPlayerStats();
        const matchData = {
            title: document.getElementById('matchTitle').value.trim(),
            team1: document.getElementById('matchTeam1').value.trim(),
            team2: document.getElementById('matchTeam2').value.trim(),
            date: document.getElementById('matchDate').value,
            winner: document.getElementById('winningTeam').value,
            timestamp: Date.now(),
            playerStats: playerStats
        };

        const matchRef = isNewMatch ? 
            await db.ref('matches').push() : 
            db.ref(`matches/${matchId}`);
        await matchRef.set(matchData);

        const playerUpdates = [];
        
        matchData.playerStats.forEach(newStats => {
            const oldStats = oldPlayerStats[newStats.name] || null;
            playerUpdates.push(updatePlayerStats(newStats, oldStats, !isNewMatch, previousWinner, matchData.winner));
        });

        await Promise.all(playerUpdates);
        showStatus(isNewMatch ? 'Match saved successfully!' : 'Match updated successfully!');
        clearMatchForm();
        updateLeaderboard();
        loadRecentMatches();
    } catch (error) {
        console.error('Error saving match:', error);
        showStatus(`Error saving match: ${error.message}`, true);
    } finally {
        hideLoading();
    }
});
    
    
    
    
    
    
    function clearMatchForm() {
        document.getElementById('matchTitle').value = '';
        document.getElementById('matchTeam1').value = '';
        document.getElementById('matchTeam2').value = '';
        document.getElementById('matchDate').value = '';
        document.getElementById('winningTeam').value = '';
        setupPlayerStatsContainer();
        playerStatsRows.innerHTML = '';
        addPlayerRow.click(); // Add one empty row
        playerEntries = [];
    }

    undoLastEntry.addEventListener('click', () => {
        if (playerEntries.length > 0) {
            const lastEntry = playerEntries.pop();
            playerStatsRows.removeChild(playerStatsRows.lastChild);
            showStatus('Last entry removed');
        } else {
            showStatus('No entries to undo', true);
        }
    });
    function loadRecentMatches() {
        return db.ref("matches").limitToLast(5).once("value")
            .then((snapshot) => {
                const matches = [];
                snapshot.forEach(childSnapshot => {
                    matches.push({
                        id: childSnapshot.key,  // Make sure to include the ID
                        ...childSnapshot.val()
                    });
                });
                displayRecentMatches(matches.reverse());
            });
    }
    
    // Load and display recent matches
    function displayRecentMatches(matches) {
        const recentMatchesList = document.getElementById("recentMatchesList");
        recentMatchesList.innerHTML = '';
        
        matches.forEach(match => {
            const matchCard = document.createElement("div");
            matchCard.className = "match-card";
            matchCard.dataset.matchId = match.id; // Add match ID to dataset
            
            matchCard.innerHTML = `
                <h3>${match.title || 'Untitled Match'}</h3>
                <p>${match.team1 || 'Team 1'} vs ${match.team2 || 'Team 2'}</p>
                <p>Date: ${new Date(match.date).toLocaleDateString()}</p>
                <p>Players: ${match.playerStats?.length || 0}</p>
                <div class="match-card-actions">
                    <button class="view-match">View Details</button>
                    <button class="edit-match">Edit Match</button>
                </div>
            `;
            
            // Make match card selectable
            matchCard.addEventListener('click', () => {
                document.querySelectorAll('.match-card').forEach(card => {
                    card.classList.remove('selected');
                });
                matchCard.classList.add('selected');
                document.getElementById('editMatch').disabled = false;
            });
            
            // View match details
            matchCard.querySelector('.view-match').addEventListener('click', (e) => {
                e.stopPropagation();
                showMatchDetails(match);
            });
            
            // Edit match
            matchCard.querySelector('.edit-match').addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.match-card').forEach(card => {
                    card.classList.remove('selected');
                });
                matchCard.classList.add('selected');
                loadMatchForEdit(match.id);
            });
            
            recentMatchesList.appendChild(matchCard);
        });
    }

    function showMatchDetails(match) {
        const dialog = document.createElement('div');
        dialog.className = 'match-details-dialog';
        
        let playerStatsHTML = '';
        if (match.playerStats && match.playerStats.length > 0) {
            playerStatsHTML = match.playerStats.map(player => `
                <tr>
                    <td>${player.name}</td>
                    <td>${player.runs || 0}</td>
                    <td>${player.notOut ? 'Yes' : 'No'}</td>
                    <td>${player.wickets || 0}</td>
                </tr>
            `).join('');
        }
        
        dialog.innerHTML = `
            <div class="match-details-content">
                <h2>${match.title}</h2>
                <p><strong>${match.team1}</strong> vs <strong>${match.team2}</strong></p>
                <p>Date: ${new Date(match.date).toLocaleDateString()}</p>
                <h3>Player Statistics</h3>
                <table class="player-stats-table">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Runs</th>
                            <th>Not Out</th>
                            <th>Wickets</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${playerStatsHTML}
                    </tbody>
                </table>
                <button class="close-dialog">Close</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        dialog.querySelector('.close-dialog').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
    }    

async function showPlayerStats(playerName) {
    showLoading();
    try {
        // Get player data
        const playerSnapshot = await db.ref(`players/${playerName}`).once('value');
        const playerData = playerSnapshot.val();

        // Get last 5 matches
        const matchesSnapshot = await db.ref('matches')
            .orderByChild("timestamp")
            .once("value");

        const matchData = [];
        matchesSnapshot.forEach(matchSnap => {
            const match = matchSnap.val();
            const playerStats = match.playerStats?.find(p => p.name === playerName);
            if (playerStats) {
                matchData.push({
                    date: new Date(match.timestamp || match.date).toLocaleDateString(),
                    runs: playerStats.runs || 0,
                    wickets: playerStats.wickets || 0
                });
            }
        });

        // Update modal content
        document.getElementById('playerNameHeader').textContent = `${playerName}'s Stats`;
        document.getElementById("statMatches").textContent = playerData.matchesPlayed;
        document.getElementById("statRuns").textContent = playerData.runs;
        document.getElementById("statWickets").textContent = playerData.wickets;
        document.getElementById("statAvgRuns").textContent = 
            (playerData.runs / playerData.matchesPlayed).toFixed(2);

        // Destroy previous chart if exists
        if (performanceChart) {
            performanceChart.destroy();
        }

        // Create new chart
        const ctx = document.getElementById("playerChart").getContext('2d');
        performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: matchData.map(m => m.date),
                datasets: [{
                    label: 'Runs',
                    data: matchData.map(m => m.runs),
                    borderColor: '#1e88e5',
                    fill: false
                }, {
                    label: 'Wickets',
                    data: matchData.map(m => m.wickets),
                    borderColor: '#43a047',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

    } catch (error) {
        console.error('Error loading player stats:', error);
        showStatus('Error loading player statistics', true);
    } finally {
        hideLoading();
    }
}
window.clearDatabase = function () {
    if (confirm("Are you sure you want to delete all player data? This action cannot be undone.")) {
        db.ref('players').remove()
            .then(() => {
                alert("Player data cleared successfully.");
                updateLeaderboard(); // Refresh leaderboard after clearing data
            })
            .catch(error => {
                console.error("Error clearing player data:", error);
                alert("Failed to clear player data.");
            });
    }
};


function closeStatsModal() {
    document.getElementById('playerStatsModal').style.display = 'none';
    if (performanceChart) {
        performanceChart.destroy();
    }
}

// Update your leaderboard click handler to use showPlayerStats
document.querySelectorAll('.player-name').forEach(element => {
    element.addEventListener('click', function() {
        showPlayerStats(this.textContent);
    });
});

    

    async function loadMatchDetails(match) {
        clearMatchForm(); // Clear existing form data
        document.getElementById('matchId').value = match.id;
        document.getElementById('matchTitle').value = match.title;
        document.getElementById('matchTeam1').value = match.team1;
        document.getElementById('matchTeam2').value = match.team2;
        document.getElementById('matchDate').value = match.date;
        
        // Clear existing player rows
        playerStatsRows.innerHTML = '';
        
        // Load player stats from the match
        if (match.playerStats && Array.isArray(match.playerStats)) {
            match.playerStats.forEach(player => {
                const row = createPlayerStatsRow();
                const inputs = row.querySelectorAll('input');
                inputs[0].value = player.name;
                inputs[1].value = player.runs || 0;
                inputs[2].checked = player.notOut || false;
                inputs[3].value = player.wickets || 0;
                playerStatsRows.appendChild(row);
            });
        }
        
        document.getElementById('editMatch').disabled = false;
        document.getElementById('createNewMatch').disabled = false;
        showStatus('Match loaded for editing');
    }
// Add to DOMContentLoaded event
function initializePlayerAnalysis() {
    // Populate player dropdown
    db.ref("players").once("value", snapshot => {
        const dropdown = document.getElementById("playerDropdown");
        dropdown.innerHTML = '<option value="">Select a Player</option>';
        
        snapshot.forEach(childSnapshot => {
            const player = childSnapshot.val();
            const option = document.createElement("option");
            option.value = player.name;
            option.textContent = player.name;
            dropdown.appendChild(option);
        });
    });

    // Add dropdown change listener
    document.getElementById("playerDropdown").addEventListener("change", function() {
        const playerName = this.value;
        if (playerName) {
            loadPlayerAnalysis(playerName);
        }
    });
}
function calculateOVR(player) {
    const matchesPlayed = player.matchesPlayed || 0;
    if (matchesPlayed === 0) 
        return { battingOVR: 55, bowlingOVR: 55, overallOVR: 55 };

    const battingAvg = player.runs / Math.max(1, player.innings || matchesPlayed);
    const bowlingAvg = player.wickets / Math.max(1, matchesPlayed);

    let battingOVR = 55;  
    if (battingAvg >= 15) battingOVR = 90;
    else if (battingAvg >= 12) battingOVR = 85;
    else if (battingAvg >= 10) battingOVR = 80;
    else if (battingAvg >= 8) battingOVR = 75;
    else if (battingAvg >= 6) battingOVR = 70;
    else if (battingAvg >= 4) battingOVR = 65;
    else battingOVR = 60;

    let bowlingOVR = 55;
    if (bowlingAvg >= 3) bowlingOVR = 92;
    else if (bowlingAvg >= 2.5) bowlingOVR = 88; // 🔹 Added a smoother step
    else if (bowlingAvg >= 2) bowlingOVR = 85;
    else if (bowlingAvg >= 1.5) bowlingOVR = 80;
    else if (bowlingAvg >= 1.3) bowlingOVR = 75;
    else if (bowlingAvg >= 1) bowlingOVR = 70;
    else if (bowlingAvg >= 0.5) bowlingOVR = 65;
    else bowlingOVR = 60;

    const consistencyScore = Math.min(100, (player.winPercentage || 0));
    const experienceScore = Math.min(100, (matchesPlayed / 10) * 100); // 🔹 Faster scaling

    // 🔥 New Balanced Overall OVR Formula 🔥
    const overallOVR = Math.round(
        (battingOVR * 1.3) +  // Batting impact
        (bowlingOVR * 1.3) +  
        (consistencyScore * 0.3) + 
        (experienceScore * 0.3)
    ) / 2.6; // 🔹 Fixed division for proper weighting

    return { 
        battingOVR: Math.round(battingOVR), 
        bowlingOVR: Math.round(bowlingOVR), 
        overallOVR: Math.min(99, Math.max(55, Math.round(overallOVR))) 
    };
}


// Function to get card class based on OVR
function getCardClass(ovr) {
    if (ovr >= 90) return 'card-icon';
    if (ovr >= 85) return 'card-toty';
    if (ovr >= 80) return 'card-totw';
    if (ovr >= 75) return 'card-rare-gold';
    if (ovr >= 70) return 'card-gold';
    if (ovr >= 65) return 'card-silver';
    return 'card-bronze';
}
function getPlayerPosition(player) {
    const battingAvg = player.runs / player.matchesPlayed;
    const wicketsPerMatch = player.wickets / player.matchesPlayed;
    
    if (battingAvg > 25 && wicketsPerMatch > 1.5) return 'ALL';
    if (battingAvg > 30) return 'BAT';
    if (wicketsPerMatch > 2) return 'BWL';
    return 'ALL';
}



// Function to update player cards
function updatePlayerCards() {
    const container = document.getElementById('playerCardsContainer');
    if (!container) return;

    showLoading();
    
    db.ref("players").once("value")
        .then(snapshot => {
            let players = [];
            snapshot.forEach(childSnapshot => {
                let player = childSnapshot.val();
                let { battingOVR, bowlingOVR, overallOVR } = calculateOVR(player);
                player.battingOVR = battingOVR;
                player.bowlingOVR = bowlingOVR;
                player.overallOVR = overallOVR;
                players.push(player);
            });

            // **Sort players in descending order of Overall OVR**
            players.sort((a, b) => b.overallOVR - a.overallOVR);

            container.innerHTML = `<div class="cards-grid">`;

            players.forEach(player => {
                const { battingOVR, bowlingOVR, overallOVR } = player;
                const cardClass = getCardClass(overallOVR);
                const position = getPlayerPosition(player);

                const battingAvg = ((player.runs || 0) / (player.innings || player.matchesPlayed || 1)).toFixed(1);
                const avgWickets = ((player.wickets || 0) / (player.matchesPlayed || 1)).toFixed(1);
                
                const card = `
                    <div class="fifa-card ${cardClass}">
                        <div class="card-header">
                            <div class="rating">${overallOVR}</div>
                            <div class="position">${position}</div>
                        </div>
                        <div class="player-name-section">
                            <h3>${player.name}</h3>
                        </div>
                        <div class="card-stats">
                            <div class="stat-group">
                                <div class="stat">
                                    <span class="value">${battingOVR}</span>
                                    <span class="label">Bat OVR</span>
                                </div>
                                <div class="stat">
                                    <span class="value">${battingAvg}</span>
                                    <span class="label">Bat AVG</span>
                                </div>
                                <div class="stat">
                                    <span class="value">${player.runs || 0}</span>
                                    <span class="label">RUNS</span>
                                </div>
                            </div>
                            <div class="stat-group">
                                <div class="stat">
                                    <span class="value">${bowlingOVR}</span>
                                    <span class="label">Bowl OVR</span>
                                </div>
                                <div class="stat">
                                    <span class="value">${avgWickets}</span>
                                    <span class="label">Wickets/M</span>
                                </div>
                                <div class="stat">
                                    <span class="value">${player.wickets || 0}</span>
                                    <span class="label">TOTAL WKT</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                container.innerHTML += card;
            });

            container.innerHTML += `</div>`;
        })
        .catch(error => {
            console.error("Error loading player cards:", error);
            showStatus('Error loading player cards', true);
        })
        .finally(() => {
            hideLoading();
        });
}




async function loadPlayerAnalysis(playerName) {
    showLoading();
    try {
        const playerSnapshot = await db.ref(`players/${playerName}`).once("value");
        const playerData = playerSnapshot.val();

        // Get match history
        const matchesSnapshot = await db.ref("matches")
            .orderByChild("timestamp")
            .once("value");

        let totalPredictedSixes = 0;
        let totalPredictedSR = 0;
        let totalInnings = 0;
        const matchData = [];
        
        // Process matches and use stored predictions
        matchesSnapshot.forEach(matchSnap => {
            const match = matchSnap.val();
            const playerStats = match.playerStats?.find(p => p.name === playerName);
            
            if (playerStats && playerStats.runs !== undefined) {
                totalInnings++;
                if (playerStats.predictedSixes !== undefined && playerStats.predictedStrikeRate !== undefined) {
                    totalPredictedSixes += playerStats.predictedSixes;
                    totalPredictedSR += playerStats.predictedStrikeRate;
                }
                
                if (matchData.length < 5) {
                    matchData.unshift({
                        date: new Date(match.timestamp || match.date).toLocaleDateString(),
                        runs: playerStats.runs || 0,
                        wickets: playerStats.wickets || 0,
                        predictedSixes: playerStats.predictedSixes || 0,
                        predictedSR: playerStats.predictedStrikeRate || 0,
                        actualSixes: playerStats.sixes || 0
                    });
                }
            }
        });

        // Update prediction displays
        if (totalInnings > 0) {
            document.getElementById('statTotalSixes').textContent = playerData.sixes || 0;
            document.getElementById('predictedTotalSixes').textContent = `Predicted: ${Math.round(totalPredictedSixes)}`;
            document.getElementById('statAvgStrikeRate').textContent = 
                ((playerData.runs / totalInnings) * 100).toFixed(2);
            document.getElementById('predictedAvgStrikeRate').textContent = 
                `Predicted: ${Math.round(totalPredictedSR / totalInnings)}`;
        }

        // Update other stats display
        document.querySelector(".player-name").textContent = playerName;
        document.getElementById("statMatches").textContent = playerData.matchesPlayed;
        document.getElementById("statRuns").textContent = playerData.runs;
        document.getElementById("statWickets").textContent = playerData.wickets;
        document.getElementById("statAvgRuns").textContent = 
            (playerData.runs / (playerData.matchesPlayed - playerData.notOuts)).toFixed(2);
        document.getElementById("statWins").textContent = playerData.wins || 0;
        document.getElementById("statLosses").textContent = playerData.losses || 0;
        document.getElementById("statWinPercentage").textContent = 
            `${playerData.winPercentage?.toFixed(2) || '0.00'}%`;

        // Update chart
        if (performanceChart) performanceChart.destroy();
        
        const ctx = document.getElementById("playerChart").getContext('2d');
        performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: matchData.map(m => m.date),
                datasets: [{
                    label: 'Runs',
                    data: matchData.map(m => m.runs),
                    borderColor: '#1e88e5',
                    fill: false
                }, {
                    label: 'Wickets',
                    data: matchData.map(m => m.wickets),
                    borderColor: '#43a047',
                    fill: false
                }, {
                    label: 'Predicted Sixes',
                    data: matchData.map(m => m.predictedSixes),
                    borderColor: '#ff9800',
                    fill: false
                }, {
                    label: 'Actual Sixes',
                    data: matchData.map(m => m.actualSixes),
                    borderColor: '#e53935',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

    } catch (error) {
        console.error('Error loading player analysis:', error);
        showStatus('Error loading player data', true);
    } finally {
        hideLoading();
    }
}
window.clearMatchData=function() {
    if (confirm("WARNING: This will delete ALL match history. Continue?")) {
        showLoading();
        db.ref('matches').remove()
            .then(() => {
                showStatus('All match data cleared successfully');
                loadRecentMatches(); // Refresh match history
            })
            .catch(error => {
                console.error("Error clearing matches:", error);
                showStatus('Failed to clear match data', true);
            })
            .finally(() => hideLoading());
    }
}

// Rename existing clear function
window.clearPlayerData= function () {
    if (confirm("WARNING: This will delete ALL player records. Continue?")) {
        showLoading();
        db.ref('players').remove()
            .then(() => {
                showStatus('All player data cleared successfully');
                updateLeaderboard();
            })
            .catch(error => {
                console.error("Error clearing players:", error);
                showStatus('Failed to clear player data', true);
            })
            .finally(() => hideLoading());
    }
}



     // Initialize real-time listeners when the app starts
     function initializeRealTimeUpdates() {
        // Leaderboard updates
        db.ref("players").on("value", (snapshot) => {
            updateLeaderboard();
        });
        
        // Match list updates
        db.ref("matches").on("child_changed", (snapshot) => {
            loadRecentMatches();
        });

        db.ref("matches").on("child_added", (snapshot) => {
            loadRecentMatches();
        });
        db.ref("players").on("value", () => {
            if (document.querySelector("#playerCards").classList.contains("active")) {
                updatePlayerCards();
            }
        });
    }
    document.querySelectorAll("nav ul li a").forEach(tab => {
        tab.addEventListener("click", function (e) {
            e.preventDefault();
            document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
            document.querySelector(this.getAttribute("href")).classList.add("active");
            document.querySelectorAll("nav ul li a").forEach(tab => tab.classList.remove("active"));
            this.classList.add("active");
            if (this.getAttribute("href") === "#playerCards") {
                updatePlayerCards();
            }
            // If switching to Create Match tab, ensure the form is visible
            if (this.getAttribute("href") === "#createMatch") {
                createMatchButtons(); // Recreate buttons when switching to Create Match tab
                document.querySelector('.match-setup-form').classList.add('active');
            }
        });
    });

    
});

// AI Prediction Model
let predictionModel = null;

// Initialize AI prediction
async function initializeAIPrediction() {
    try {
        showLoading();
        const response = await fetch('model.json');
        window.modelParams = await response.json();
        
        // Add event listener for predict button
        document.getElementById('predictButton').addEventListener('click', async () => {
            const runs = parseInt(document.getElementById('predictedRuns').value);
            const battingStyle = document.getElementById('inningsType').value;
            
            if (isNaN(runs) || runs < 0) {
                showStatus('Please enter valid runs', true);
                return;
            }
            
            await predictPerformance(runs, battingStyle);
        });
        
        showStatus('AI model initialized successfully!');
        hideLoading();
    } catch (error) {
        console.error('Error initializing AI model:', error);
        showStatus('Error initializing AI model', true);
        hideLoading();
    }
}

// Train the model with historical data
async function trainPredictionModel() {
    return initializeAIPrediction();
}

// Helper function to calculate confidence score
function calculateConfidence(runs, battingStyle) {
    // Find similar cases in the training data
    const similarCases = window.trainingData ? window.trainingData.filter(row => {
        const runDiff = Math.abs(parseFloat(row['runs scored']) - runs);
        const sameStyle = row['innings type'].toLowerCase() === battingStyle.toLowerCase();
        return runDiff <= 5 && sameStyle;
    }) : [];

    // Base confidence on number of similar cases
    const baseConfidence = Math.min((similarCases.length / 3) * 100, 90);
    return Math.max(Math.min(baseConfidence, 90), 50); // Keep between 50% and 90%
}

// Function to make predictions
async function predictPerformance(runs, battingStyle) {
    if (!window.modelParams) {
        showStatus('AI model not initialized', true);
        return;
    }

    try {
        showLoading();
        
        // Convert batting style to numerical value
        const battingStyleValue = getBattingStyleValue(battingStyle);
        
        // Scale inputs using the saved scaler parameters
        const runsScaled = (runs - window.modelParams.X_scaler.data_min[0]) / 
            (window.modelParams.X_scaler.data_max[0] - window.modelParams.X_scaler.data_min[0]);
        
        // Make prediction using the pre-trained weights
        const X = [1, runsScaled, battingStyleValue]; // Add bias term
        const prediction = {
            sixes: 0,
            strikeRate: 0
        };
        
        // Apply the model weights
        for (let i = 0; i < 2; i++) {
            prediction[i === 0 ? 'strikeRate' : 'sixes'] = 
                window.modelParams.weights[0][i] + 
                window.modelParams.weights[1][i] * runsScaled + 
                window.modelParams.weights[2][i] * battingStyleValue;
        }
        
        // Unscale predictions
        const strikeRate = prediction.strikeRate * 
            (window.modelParams.y_scaler.data_max[0] - window.modelParams.y_scaler.data_min[0]) + 
            window.modelParams.y_scaler.data_min[0];
        const sixes = prediction.sixes * 
            (window.modelParams.y_scaler.data_max[1] - window.modelParams.y_scaler.data_min[1]) + 
            window.modelParams.y_scaler.data_min[1];
        
        // Apply batting style adjustments
        let finalStrikeRate = strikeRate;
        let finalSixes = sixes;
        
        if (battingStyle === 'aggressive') {
            finalStrikeRate *= 1.2;
            finalSixes = Math.min(finalSixes + 1, Math.floor(runs / 6));
        } else if (battingStyle === 'defensive') {
            finalStrikeRate *= 0.8;
            finalSixes = Math.max(finalSixes - 1, 0);
        }
        
        // Ensure predictions are within reasonable bounds
        finalStrikeRate = Math.max(80, Math.min(300, Math.round(finalStrikeRate)));
        finalSixes = Math.max(0, Math.min(Math.floor(runs / 6), Math.round(finalSixes)));
        
        // Calculate confidence
        const confidence = calculateConfidence(runs, battingStyle);
        
        // Update UI
        document.getElementById('predictedSixes').textContent = finalSixes;
        document.getElementById('predictedStrikeRate').textContent = finalStrikeRate;
        document.getElementById('confidenceValue').textContent = `${confidence}%`;
        document.getElementById('confidenceFill').style.width = `${confidence}%`;
        
        hideLoading();
    } catch (error) {
        console.error('Error making prediction:', error);
        showStatus('Error making prediction', true);
        hideLoading();
    }
}

// Helper function to convert innings type to numerical value
function getInningsTypeValue(type) {
    switch (type) {
        case 'powerplay': return 0;
        case 'middle': return 0.5;
        case 'death': return 1;
        default: return 0.5;
    }
}

// Helper function to convert batting style to numerical value
function getBattingStyleValue(style) {
    switch (style.toLowerCase()) {
        case 'aggressive': return 1.0;
        case 'balanced': return 0.5;
        case 'defensive': return 0.0;
        default: return 0.5;
    }
}

// Function to read CSV file
async function readCSVFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const text = e.target.result;
                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                const data = [];
                
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim() === '') continue;
                    const values = lines[i].split(',').map(v => v.trim());
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index];
                    });
                    data.push(row);
                }
                resolve(data);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// Function to train model with CSV data
async function trainModelWithData(data) {
    if (!predictionModel) {
        // Create a more sophisticated model architecture with 3 input features
        predictionModel = tf.sequential({
            layers: [
                tf.layers.dense({
                    inputShape: [3],  // Changed from 2 to 3 to match input dimensions
                    units: 32,
                    activation: 'relu',
                    kernelInitializer: 'heNormal'
                }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({
                    units: 16,
                    activation: 'relu'
                }),
                tf.layers.dense({
                    units: 2,
                    activation: 'sigmoid'  // Use sigmoid for bounded output
                })
            ]
        });

        predictionModel.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError'
        });
    }

    // Prepare training data
    const trainingData = [];
    const labels = [];

    // Find max and min values for better normalization
    const maxRuns = Math.max(...data.map(row => parseFloat(row['runs scored'])));
    const minRuns = Math.min(...data.map(row => parseFloat(row['runs scored'])));
    const maxStrikeRate = Math.max(...data.map(row => parseFloat(row['strike rate'])));
    const minStrikeRate = Math.min(...data.map(row => parseFloat(row['strike rate'])));
    const maxSixes = Math.max(...data.map(row => parseFloat(row['no. of 6s'])));
    const minSixes = Math.min(...data.map(row => parseFloat(row['no. of 6s'])));

    data.forEach(row => {
        // Normalize input data using min-max normalization
        const runs = (parseFloat(row['runs scored']) - minRuns) / (maxRuns - minRuns);
        const battingStyleValue = getBattingStyleValue(row['innings type']);
        const experience = 0.5; // Add a default experience value as third feature
        
        // Add to training data with 3 features
        trainingData.push([runs, battingStyleValue, experience]);
        
        // Normalize labels using min-max normalization
        const sixes = (parseFloat(row['no. of 6s']) - minSixes) / (maxSixes - minSixes);
        const strikeRate = (parseFloat(row['strike rate']) - minStrikeRate) / (maxStrikeRate - minStrikeRate);
        
        labels.push([sixes, strikeRate]);
    });

    // Store normalization parameters for predictions
    window.modelParams = {
        maxRuns, minRuns,
        maxStrikeRate, minStrikeRate,
        maxSixes, minSixes
    };

    // Convert to tensors
    const xs = tf.tensor2d(trainingData);
    const ys = tf.tensor2d(labels);

    // Train the model with your data
    await predictionModel.fit(xs, ys, {
        epochs: 200,  // Increase epochs for better learning
        batchSize: 8,  // Smaller batch size for better generalization
        validationSplit: 0.2,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                if (epoch % 10 === 0) {
                    console.log(`Epoch ${epoch + 1}/200, Loss: ${logs.loss.toFixed(4)}`);
                }
            }
        }
    });

    // Store the training data for confidence calculation
    window.trainingData = data;

    // Clean up tensors
    xs.dispose();
    ys.dispose();
}

// Load pre-trained model parameters
let modelParams = null;

async function loadPreTrainedModel() {
    try {
        const response = await fetch('model.json');
        modelParams = await response.json();
        showStatus('AI model loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading model:', error);
        showStatus('Error loading AI model', true);
        return false;
    }
}

// Function to calculate confidence score
function calculateConfidence(runs, battingStyle) {
    // Find similar cases in the training data
    const similarCases = window.trainingData ? window.trainingData.filter(row => {
        const runDiff = Math.abs(parseFloat(row['runs scored']) - runs);
        const sameStyle = row['innings type'].toLowerCase() === battingStyle.toLowerCase();
        return runDiff <= 5 && sameStyle;
    }) : [];

    // Base confidence on number of similar cases
    const baseConfidence = Math.min((similarCases.length / 3) * 100, 90);
    return Math.max(Math.min(baseConfidence, 90), 50); // Keep between 50% and 90%
}

// Function to make predictions
async function predictPerformance(runs, battingStyle) {
    if (!window.modelParams) {
        showStatus('AI model not initialized', true);
        return;
    }

    try {
        showLoading();
        
        // Convert batting style to numerical value
        const battingStyleValue = getBattingStyleValue(battingStyle);
        
        // Scale inputs using the saved scaler parameters
        const runsScaled = (runs - window.modelParams.X_scaler.data_min[0]) / 
            (window.modelParams.X_scaler.data_max[0] - window.modelParams.X_scaler.data_min[0]);
        
        // Make prediction using the pre-trained weights
        const X = [1, runsScaled, battingStyleValue]; // Add bias term
        const prediction = {
            sixes: 0,
            strikeRate: 0
        };
        
        // Apply the model weights
        for (let i = 0; i < 2; i++) {
            prediction[i === 0 ? 'strikeRate' : 'sixes'] = 
                window.modelParams.weights[0][i] + 
                window.modelParams.weights[1][i] * runsScaled + 
                window.modelParams.weights[2][i] * battingStyleValue;
        }
        
        // Unscale predictions
        const strikeRate = prediction.strikeRate * 
            (window.modelParams.y_scaler.data_max[0] - window.modelParams.y_scaler.data_min[0]) + 
            window.modelParams.y_scaler.data_min[0];
        const sixes = prediction.sixes * 
            (window.modelParams.y_scaler.data_max[1] - window.modelParams.y_scaler.data_min[1]) + 
            window.modelParams.y_scaler.data_min[1];
        
        // Apply batting style adjustments
        let finalStrikeRate = strikeRate;
        let finalSixes = sixes;
        
        if (battingStyle === 'aggressive') {
            finalStrikeRate *= 1.2;
            finalSixes = Math.min(finalSixes + 1, Math.floor(runs / 6));
        } else if (battingStyle === 'defensive') {
            finalStrikeRate *= 0.8;
            finalSixes = Math.max(finalSixes - 1, 0);
        }
        
        // Ensure predictions are within reasonable bounds
        finalStrikeRate = Math.max(80, Math.min(300, Math.round(finalStrikeRate)));
        finalSixes = Math.max(0, Math.min(Math.floor(runs / 6), Math.round(finalSixes)));
        
        // Calculate confidence
        const confidence = calculateConfidence(runs, battingStyle);
        
        // Update UI
        document.getElementById('predictedSixes').textContent = finalSixes;
        document.getElementById('predictedStrikeRate').textContent = finalStrikeRate;
        document.getElementById('confidenceValue').textContent = `${confidence}%`;
        document.getElementById('confidenceFill').style.width = `${confidence}%`;
        
        hideLoading();
    } catch (error) {
        console.error('Error making prediction:', error);
        showStatus('Error making prediction', true);
        hideLoading();
    }
}

// Helper function for making predictions
async function makePrediction(runs, battingStyle) {
    try {
        // If runs are 0, return 0 for both predictions
        if (runs === 0) {
            return {
                predictedStrikeRate: 0,
                predictedSixes: 0
            };
        }

        const response = await fetch('model.json');
        const modelParams = await response.json();
        
        // Convert batting style to numerical value
        const battingStyleValue = getBattingStyleValue(battingStyle);
        
        // Scale inputs using the saved scaler parameters
        const runsScaled = (runs - modelParams.X_scaler.data_min[0]) / 
            (modelParams.X_scaler.data_max[0] - modelParams.X_scaler.data_min[0]);
        
        // Make prediction using the pre-trained weights
        const X = [1, runsScaled, battingStyleValue]; // Add bias term
        const prediction = {
            sixes: 0,
            strikeRate: 0
        };
        
        // Apply the model weights
        for (let i = 0; i < 2; i++) {
            prediction[i === 0 ? 'strikeRate' : 'sixes'] = 
                modelParams.weights[0][i] + 
                modelParams.weights[1][i] * runsScaled + 
                modelParams.weights[2][i] * battingStyleValue;
        }
        
        // Unscale predictions
        let predictedStrikeRate = prediction.strikeRate * 
            (modelParams.y_scaler.data_max[0] - modelParams.y_scaler.data_min[0]) + 
            modelParams.y_scaler.data_min[0];
        let predictedSixes = prediction.sixes * 
            (modelParams.y_scaler.data_max[1] - modelParams.y_scaler.data_min[1]) + 
            modelParams.y_scaler.data_min[1];
        
        // Calculate maximum possible sixes based on runs
        const maxPossibleSixes = Math.floor(runs / 6);
        
        // Apply batting style adjustments without randomization
        if (battingStyle === 'aggressive') {
            if (runs > 15) {
                predictedStrikeRate *= 0.93; // Reduce by 35% for high runs
            } else {
                predictedStrikeRate *= 1.02; // Normal 15% increase for low runs
            }
            predictedSixes = Math.min(maxPossibleSixes, Math.round(predictedSixes * 1.2));
        } else if (battingStyle === 'defensive') {
            predictedStrikeRate *= 0.8;
            predictedSixes = Math.round(predictedSixes * 0.8);
            
            // Guarantee at least 1 six for defensive style if score exceeds 18
            if (runs > 18) {
                predictedSixes = Math.max(1, predictedSixes);
            }
        } else {
            // For balanced style, no adjustment
            predictedSixes = Math.round(predictedSixes);
        }
        
        // Ensure predictions are non-negative and sixes are realistic
        predictedStrikeRate = Math.max(0, Math.round(predictedStrikeRate));
        predictedSixes = Math.min(maxPossibleSixes, Math.max(0, predictedSixes));
        
        // For scores less than 6 runs, force zero sixes
        if (runs < 6) {
            predictedSixes = 0;
        }
        // For scores between 6 and 9, use a fixed probability
        else if (runs < 9) {
            const lowScoreProb = (runs - 5) / 4; // Probability increases from 0 to 1 as runs go from 6 to 9
            predictedSixes = lowScoreProb > 0.5 ? 1 : 0; // Fixed decision based on probability threshold
        }
        
        return { predictedStrikeRate, predictedSixes };
    } catch (error) {
        console.error('Prediction error:', error);
        return null;
    }
}

function createPlayerStatsRow(teamNumber) {
    const row = document.createElement("div");
    row.className = "player-stats-row";
    row.innerHTML = `
        <div class="team-indicator">Team ${teamNumber}
            <input type="text" placeholder="Player Name">
            <input type="number" class="runs-input" placeholder="Runs" min="0">
            <select class="innings-type-select">
                <option value="aggressive">Aggressive</option>
                <option value="balanced">Balanced</option>
                <option value="defensive">Defensive</option>
            </select>
            <input type="checkbox" title="Not Out">
            <input type="number" placeholder="Wickets" min="0">
            <input type="number" placeholder="Catch / Run out Bonus" min="0" max="5">
            <div class="prediction-display" style="display: none;">
                <span>Predicted: </span>
                <span class="predicted-sixes">-</span> sixes,
                <span class="predicted-sr">-</span> SR
            </div>
            <button class="remove-player" type="button">×</button>
        </div>
    `;

    const runsInput = row.querySelector('.runs-input');
    const inningsType = row.querySelector('.innings-type-select');
    const predictionDisplay = row.querySelector('.prediction-display');

    let lastRuns = 0;
    let lastInningsType = 'balanced';

    async function updatePrediction() {
        const currentRuns = parseInt(runsInput.value) || 0;
        const currentInningsType = inningsType.value;

        // Only update if runs or innings type has changed
        if (currentRuns !== lastRuns || currentInningsType !== lastInningsType) {
            const prediction = await makePrediction(currentRuns, currentInningsType);
            if (prediction) {
                predictionDisplay.style.display = 'block';
                predictionDisplay.querySelector('.predicted-sixes').textContent = prediction.predictedSixes;
                predictionDisplay.querySelector('.predicted-sr').textContent = prediction.predictedStrikeRate;
                
                // Store the current values
                lastRuns = currentRuns;
                lastInningsType = currentInningsType;
            } else {
                predictionDisplay.style.display = 'none';
            }
        }
    }

    runsInput.addEventListener('input', updatePrediction);
    inningsType.addEventListener('change', updatePrediction);
    
    // Update the remove player event listener to properly remove the row and its stats
    row.querySelector(".remove-player").addEventListener("click", async () => {
        const playerName = row.querySelector('input[type="text"]').value.trim();
        if (playerName) {
            const matchId = document.getElementById('matchId').value;
            if (matchId) {
                try {
                    // Get the player's current stats from this match
                    const matchSnapshot = await db.ref(`matches/${matchId}`).once('value');
                    const match = matchSnapshot.val();
                    const playerStats = match.playerStats || [];
                    const playerStat = playerStats.find(stat => stat.name === playerName);

                    if (playerStat) {
                        // First subtract the stats from player's overall stats
                        await db.ref(`players/${playerName}`).transaction(player => {
                            if (player) {
                                // Calculate new values, ensuring they don't go below 0
                                const newRuns = Math.max(0, (player.runs || 0) - (playerStat.runs || 0));
                                const newWickets = Math.max(0, (player.wickets || 0) - (playerStat.wickets || 0));
                                const newMatchesPlayed = Math.max(0, (player.matchesPlayed || 0) - 1);
                                const newInnings = Math.max(0, (player.innings || 0) - 1);
                                const newNotOuts = Math.max(0, (player.notOuts || 0) - (playerStat.notOut ? 1 : 0));
                                const newWins = Math.max(0, (player.wins || 0) - (playerStat.isWinner ? 1 : 0));
                                const newLosses = Math.max(0, (player.losses || 0) - (playerStat.isWinner === false ? 1 : 0));
                                const newBonusPoints = Math.max(0, (player.bonusPoints || 0) - (playerStat.bonus || 0));
                                const newPredictedSixes = Math.max(0, (player.predictedSixes || 0) - (playerStat.predictedSixes || 0));
                                const newPredictedStrikeRate = Math.max(0, (player.predictedStrikeRate || 0) - (playerStat.predictedStrikeRate || 0));

                                // Calculate new win percentage
                                const newWinPercentage = newMatchesPlayed > 0 ? 
                                    ((newWins / newMatchesPlayed) * 100) : 0;

                                // Calculate new points
                                const newPoints = calculatePoints(
                                    newRuns,
                                    newWickets,
                                    newMatchesPlayed,
                                    newInnings,
                                    newNotOuts,
                                    newBonusPoints
                                );

                                return {
                                    ...player,
                                    runs: newRuns,
                                    wickets: newWickets,
                                    matchesPlayed: newMatchesPlayed,
                                    innings: newInnings,
                                    notOuts: newNotOuts,
                                    wins: newWins,
                                    losses: newLosses,
                                    winPercentage: parseFloat(newWinPercentage.toFixed(2)),
                                    bonusPoints: newBonusPoints,
                                    predictedSixes: newPredictedSixes,
                                    predictedStrikeRate: newPredictedStrikeRate,
                                    points: newPoints
                                };
                            }
                            return null;
                        });

                        // Then remove player from match stats
                        const updatedStats = playerStats.filter(stat => stat.name !== playerName);
                        await db.ref(`matches/${matchId}/playerStats`).set(updatedStats);

                        // Show success message
                        showStatus(`Removed ${playerName}'s stats successfully`);
                    }
                } catch (error) {
                    console.error('Error removing player stats:', error);
                    showStatus('Error removing player stats', true);
                    return; // Don't remove the row if there was an error
                }
            }
        }
        // Only remove the row after successful database updates
        row.remove();
    });

    return row;
}


