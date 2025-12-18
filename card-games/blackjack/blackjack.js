class BlackjackGame {
    constructor() {
        this.startingBalance = 1000;
        this.balance = 1000;
        this.currentBet = 10;
        this.deck = [];
        this.dealerHand = [];
        this.playerHand = [];
        this.gameInProgress = false;
        this.dealerHitsOnSoft17 = false; // Standard rule: dealer stands on soft 17
        this.stats = {
            gamesPlayed: 0,
            wins: 0,
            losses: 0
        };
        this.gameHistory = [];
        this.runningTotal = 0;
        
        this.suits = ['♠', '♥', '♦', '♣'];
        this.ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        this.init();
    }
    
    init() {
        this.createDeck();
        this.shuffleDeck();
        this.updateDisplay();
        this.attachEventListeners();
    }
    
    createDeck() {
        this.deck = [];
        for (let suit of this.suits) {
            for (let rank of this.ranks) {
                this.deck.push({ suit, rank });
            }
        }
    }
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    dealCard(hand) {
        if (this.deck.length === 0) {
            this.createDeck();
            this.shuffleDeck();
        }
        const card = this.deck.pop();
        hand.push(card);
        return card;
    }
    
    getCardValue(card) {
        if (card.rank === 'A') return 11;
        if (['J', 'Q', 'K'].includes(card.rank)) return 10;
        return parseInt(card.rank);
    }
    
    calculateHandValue(hand) {
        let value = 0;
        let aces = 0;
        
        for (let card of hand) {
            if (card.rank === 'A') {
                aces++;
                value += 11;
            } else {
                value += this.getCardValue(card);
            }
        }
        
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        
        return value;
    }
    
    isBlackjack(hand) {
        return hand.length === 2 && this.calculateHandValue(hand) === 21;
    }
    
    isSoft17(hand) {
        // Soft 17 means hand totals 17 with an Ace counted as 11
        const value = this.calculateHandValue(hand);
        if (value !== 17) return false;
        
        // Check if there's an Ace counted as 11
        let hasAceAs11 = false;
        let total = 0;
        for (let card of hand) {
            if (card.rank === 'A') {
                total += 11;
                hasAceAs11 = true;
            } else {
                total += this.getCardValue(card);
            }
        }
        
        // If total is exactly 17 and we have an Ace counted as 11, it's soft 17
        return total === 17 && hasAceAs11;
    }
    
    startGame() {
        if (this.currentBet > this.balance) {
            this.showMessage('Insufficient balance!', 'error');
            return;
        }
        
        if (this.currentBet < 5) {
            this.showMessage('Minimum bet is $5!', 'error');
            return;
        }
        
        this.balance -= this.currentBet;
        this.gameInProgress = true;
        this.dealerHand = [];
        this.playerHand = [];
        
        // Deal initial cards
        this.dealCard(this.playerHand);
        this.dealCard(this.dealerHand);
        this.dealCard(this.playerHand);
        this.dealCard(this.dealerHand);
        
        this.updateDisplay();
        this.updateControls();
        this.updateGameStatus('');
        
        // Check for blackjack
        if (this.isBlackjack(this.playerHand)) {
            if (this.isBlackjack(this.dealerHand)) {
                this.endGame('push', 'Both have Blackjack! Push.');
            } else {
                this.endGame('win', 'Blackjack! You win!');
            }
        } else if (this.isBlackjack(this.dealerHand)) {
            this.endGame('lose', 'Dealer has Blackjack! You lose.');
        }
    }
    
    hit() {
        if (!this.gameInProgress) return;
        
        this.dealCard(this.playerHand);
        this.updateDisplay();
        this.updateControls(); // Update controls to disable double-down after hitting
        
        const playerValue = this.calculateHandValue(this.playerHand);
        
        if (playerValue > 21) {
            this.endGame('lose', 'Bust! You went over 21.');
        } else if (playerValue === 21) {
            this.stand();
        }
    }
    
    async stand() {
        if (!this.gameInProgress) return;
        
        // Reveal dealer's hidden card
        this.updateDisplay();
        this.updateGameStatus('Dealer reveals cards...');
        
        // Dealer draws until 17 or higher
        // Standard rule: Dealer stands on 17 or higher (both soft and hard 17)
        // Optional rule: Dealer hits on soft 17, stands on hard 17
        let dealerValue = this.calculateHandValue(this.dealerHand);
        while (dealerValue < 17 || (this.dealerHitsOnSoft17 && this.isSoft17(this.dealerHand))) {
            await this.sleep(800); // Small delay to show dealer's action
            this.dealCard(this.dealerHand);
            dealerValue = this.calculateHandValue(this.dealerHand);
            this.updateDisplay();
            if (dealerValue < 17 || (this.dealerHitsOnSoft17 && this.isSoft17(this.dealerHand))) {
                const status = this.isSoft17(this.dealerHand) ? 'soft 17' : dealerValue;
                this.updateGameStatus(`Dealer hits (${status})...`);
            }
        }
        
        // dealerValue is already declared above, just recalculate to ensure accuracy
        dealerValue = this.calculateHandValue(this.dealerHand);
        const playerValue = this.calculateHandValue(this.playerHand);
        
        // Show dealer's final action
        if (dealerValue >= 17 && dealerValue <= 21) {
            this.updateGameStatus(`Dealer stands with ${dealerValue}`);
            await this.sleep(1000);
        }
        
        if (dealerValue > 21) {
            this.endGame('win', 'Dealer busts! You win!');
        } else if (dealerValue > playerValue) {
            this.endGame('lose', `Dealer wins with ${dealerValue}!`);
        } else if (playerValue > dealerValue) {
            this.endGame('win', `You win with ${playerValue}!`);
        } else {
            this.endGame('push', 'Push! It\'s a tie.');
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async doubleDown() {
        if (!this.gameInProgress) {
            return;
        }
        
        if (this.playerHand.length !== 2) {
            this.showMessage('Double down is only available with exactly 2 cards!', 'lose');
            return;
        }
        
        if (this.currentBet * 2 > this.balance) {
            this.showMessage('Insufficient balance for double down!', 'lose');
            return;
        }
        
        this.balance -= this.currentBet;
        this.currentBet *= 2;
        this.dealCard(this.playerHand);
        this.updateDisplay();
        
        const playerValue = this.calculateHandValue(this.playerHand);
        
        if (playerValue > 21) {
            this.endGame('lose', 'Bust! You went over 21.');
        } else {
            await this.stand();
        }
    }
    
    endGame(result, message) {
        this.gameInProgress = false;
        this.stats.gamesPlayed++;
        
        let netAmount = 0;
        if (result === 'win') {
            this.balance += this.currentBet * 2;
            netAmount = this.currentBet; // Profit (bet returned + bet won)
            this.stats.wins++;
        } else if (result === 'push') {
            this.balance += this.currentBet;
            netAmount = 0; // No profit, no loss
        } else {
            netAmount = -this.currentBet; // Loss
            this.stats.losses++;
        }
        
        // Add to history
        this.gameHistory.unshift({
            gameNumber: this.stats.gamesPlayed,
            bet: this.currentBet,
            result: result,
            netAmount: netAmount
        });
        
        // Calculate running total from balance difference (more accurate)
        this.runningTotal = this.balance - this.startingBalance;
        
        this.updateDisplay();
        this.updateControls();
        this.updateGameStatus(message, result);
        this.updateHistory();
        this.showModal(result === 'win' ? 'You Win!' : result === 'lose' ? 'You Lose!' : 'Push!', message, result);
    }
    
    newGame() {
        // Reset balance and game state
        this.balance = this.startingBalance;
        this.runningTotal = 0;
        this.dealerHand = [];
        this.playerHand = [];
        this.gameInProgress = false;
        this.stats = {
            gamesPlayed: 0,
            wins: 0,
            losses: 0
        };
        this.gameHistory = [];
        this.createDeck();
        this.shuffleDeck();
        this.updateDisplay();
        this.updateControls();
        this.updateGameStatus('');
    }
    
    renderCard(card, isHidden = false) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        
        if (isHidden) {
            cardDiv.classList.add('card-back');
            cardDiv.textContent = '🂠';
        } else {
            const isRed = card.suit === '♥' || card.suit === '♦';
            cardDiv.classList.add(isRed ? 'red' : 'black');
            
            cardDiv.innerHTML = `
                <div class="card-rank">${card.rank}</div>
                <div class="card-suit">${card.suit}</div>
                <div class="card-rank-bottom">${card.rank}</div>
            `;
        }
        
        return cardDiv;
    }
    
    updateDisplay() {
        // Update balance
        document.getElementById('balance').textContent = `$${this.balance}`;
        
        // Update bet display
        this.updateBetDisplay();
        
        // Update player cards
        const playerCardsContainer = document.getElementById('playerCards');
        playerCardsContainer.innerHTML = '';
        this.playerHand.forEach(card => {
            playerCardsContainer.appendChild(this.renderCard(card));
        });
        
        // Update dealer cards
        const dealerCardsContainer = document.getElementById('dealerCards');
        dealerCardsContainer.innerHTML = '';
        this.dealerHand.forEach((card, index) => {
            const isHidden = index === 0 && this.gameInProgress && this.dealerHand.length === 2;
            dealerCardsContainer.appendChild(this.renderCard(card, isHidden));
        });
        
        // Update scores
        const playerValue = this.calculateHandValue(this.playerHand);
        document.getElementById('playerScore').textContent = this.playerHand.length > 0 ? playerValue : '';
        
        const dealerValue = this.calculateHandValue(this.dealerHand);
        const dealerDisplayValue = (this.gameInProgress && this.dealerHand.length === 2) ? '?' : dealerValue;
        document.getElementById('dealerScore').textContent = this.dealerHand.length > 0 ? dealerDisplayValue : '';
        
        // Update stats
        document.getElementById('gamesPlayed').textContent = this.stats.gamesPlayed;
        document.getElementById('wins').textContent = this.stats.wins;
        document.getElementById('losses').textContent = this.stats.losses;
        const winRate = this.stats.gamesPlayed > 0 
            ? Math.round((this.stats.wins / this.stats.gamesPlayed) * 100) 
            : 0;
        document.getElementById('winRate').textContent = `${winRate}%`;
        
        // Update history display
        this.updateHistory();
    }
    
    updateBetDisplay() {
        // Update "You Bet" display
        const currentBetDisplay = document.getElementById('currentBetDisplay');
        if (currentBetDisplay) {
            currentBetDisplay.textContent = `$${this.currentBet}`;
        }
        
        // Calculate and update "You Win" display
        // Regular win: bet * 2 (you get your bet back + equal winnings)
        // Blackjack: bet * 2.5 (you get your bet back + 1.5x winnings)
        const potentialWinDisplay = document.getElementById('potentialWinDisplay');
        if (potentialWinDisplay) {
            if (this.gameInProgress && this.playerHand.length === 2 && this.isBlackjack(this.playerHand)) {
                // If player has blackjack, show potential blackjack winnings
                potentialWinDisplay.textContent = `$${Math.floor(this.currentBet * 2.5)}`;
            } else {
                // Regular win potential (bet * 2)
                potentialWinDisplay.textContent = `$${this.currentBet * 2}`;
            }
        }
    }
    
    updateHistory() {
        const historyList = document.getElementById('historyList');
        const runningTotalEl = document.getElementById('runningTotal');
        
        if (!historyList || !runningTotalEl) return;
        
        // Update running total
        if (this.runningTotal > 0) {
            runningTotalEl.textContent = `+ $${this.runningTotal}`;
        } else if (this.runningTotal < 0) {
            runningTotalEl.textContent = `- $${Math.abs(this.runningTotal)}`;
        } else {
            runningTotalEl.textContent = `$${this.runningTotal}`;
        }
        runningTotalEl.style.color = this.runningTotal > 0 ? '#4caf50' : this.runningTotal < 0 ? '#f44336' : '#ffc107';
        
        // Clear and rebuild history list
        if (this.gameHistory.length === 0) {
            historyList.innerHTML = '<div class="history-empty">No games played yet</div>';
            return;
        }
        
        historyList.innerHTML = '';
        this.gameHistory.forEach(game => {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${game.result}`;
            
            const resultText = game.result === 'win' ? 'Win' : game.result === 'lose' ? 'Loss' : 'Push';
            const amountClass = game.netAmount > 0 ? 'positive' : game.netAmount < 0 ? 'negative' : 'neutral';
            
            // Format amount with sign before dollar sign
            let formattedAmount;
            if (game.netAmount > 0) {
                formattedAmount = `+ $${game.netAmount}`;
            } else if (game.netAmount < 0) {
                formattedAmount = `- $${Math.abs(game.netAmount)}`;
            } else {
                formattedAmount = `$${game.netAmount}`;
            }
            
            historyItem.innerHTML = `
                <div class="history-item-header">
                    <span class="history-game-number">Game #${game.gameNumber}</span>
                    <span class="history-result ${game.result}">${resultText}</span>
                </div>
                <div class="history-details">
                    <span class="history-bet">Bet: $${game.bet}</span>
                    <span class="history-amount ${amountClass}">${formattedAmount}</span>
                </div>
            `;
            
            historyList.appendChild(historyItem);
        });
    }
    
    updateControls() {
        const dealBtn = document.getElementById('dealBtn');
        const hitBtn = document.getElementById('hitBtn');
        const standBtn = document.getElementById('standBtn');
        const doubleBtn = document.getElementById('doubleBtn');
        const newGameBtn = document.getElementById('newGameBtn');
        
        if (this.gameInProgress) {
            dealBtn.disabled = true;
            hitBtn.disabled = false;
            standBtn.disabled = false;
            doubleBtn.disabled = this.currentBet * 2 > this.balance || this.playerHand.length !== 2;
            newGameBtn.disabled = true;
        } else {
            dealBtn.disabled = this.balance < 5;
            hitBtn.disabled = true;
            standBtn.disabled = true;
            doubleBtn.disabled = true;
            newGameBtn.disabled = this.playerHand.length === 0;
        }
    }
    
    updateGameStatus(message, type = '') {
        const statusEl = document.getElementById('gameStatus');
        statusEl.textContent = message;
        statusEl.className = 'game-status ' + type;
    }
    
    showMessage(message, type) {
        this.updateGameStatus(message, type);
        setTimeout(() => {
            this.updateGameStatus('');
        }, 3000);
    }
    
    showModal(title, message, result = '') {
        const modal = document.getElementById('gameOverModal');
        const modalContent = modal.querySelector('.modal-content');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        
        // Remove previous result classes
        modalContent.classList.remove('modal-win', 'modal-lose', 'modal-push');
        
        // Add result class for styling
        if (result) {
            modalContent.classList.add(`modal-${result}`);
        }
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.add('active');
    }
    
    attachEventListeners() {
        // Deal button
        document.getElementById('dealBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        // Hit button
        document.getElementById('hitBtn').addEventListener('click', () => {
            this.hit();
        });
        
        // Stand button
        document.getElementById('standBtn').addEventListener('click', () => {
            this.stand();
        });
        
        // Double down button
        document.getElementById('doubleBtn').addEventListener('click', () => {
            this.doubleDown();
        });
        
        // New game button
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.newGame();
        });
        
        // Bet amount controls
        document.getElementById('betMinus').addEventListener('click', () => {
            this.currentBet = Math.max(5, this.currentBet - 5);
            document.getElementById('betAmount').value = this.currentBet;
            this.updateBetDisplay();
        });
        
        document.getElementById('betPlus').addEventListener('click', () => {
            this.currentBet = Math.min(500, Math.min(this.balance, this.currentBet + 5));
            document.getElementById('betAmount').value = this.currentBet;
            this.updateBetDisplay();
        });
        
        document.getElementById('betAmount').addEventListener('input', (e) => {
            let value = parseInt(e.target.value) || 5;
            value = Math.max(5, Math.min(500, Math.min(this.balance, value)));
            this.currentBet = value;
            e.target.value = value;
            this.updateBetDisplay();
        });
        
        // Quick bet buttons
        document.querySelectorAll('.quick-bet-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.dataset.amount);
                this.currentBet = Math.min(amount, this.balance);
                document.getElementById('betAmount').value = this.currentBet;
                this.updateBetDisplay();
            });
        });
        
        // Modal close
        document.getElementById('modalOkBtn').addEventListener('click', () => {
            document.getElementById('gameOverModal').classList.remove('active');
            this.updateControls();
        });
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new BlackjackGame();
});

