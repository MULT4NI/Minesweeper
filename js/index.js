document.addEventListener('DOMContentLoaded', function() {
    const difficultySelector = document.getElementById('difficulty');
    const startButton = document.getElementById('start');
    const gameGrid = document.getElementById('gameGrid');

    let cells = [];
    let firstClick = true;
    let gameActive = true;

    const games = {
        easy: {rowCount: 8, columnCount: 8, mineCount: 10},
        medium: {rowCount: 14, columnCount: 14, mineCount: 40},
        hard: {rowCount: 20, columnCount: 20, mineCount: 99}
    };

    function Cell(row, col) {
        this.row = row;
        this.col = col;
        this.bid = `r_${row}_c_${col}`;
        this.is_mine = false;
        this.is_exposed = false;
        this.adjacent_count = 0;
    }

    Cell.prototype.show = function() {
        const button = document.getElementById(this.bid);
        if (this.is_exposed) {
            button.className = 'exposed';
            if (this.is_mine) {
                button.className = 'mine'; // Style for a mine
                button.textContent = 'M'; // Optionally, show a symbol or text
            } else {
                button.textContent = this.adjacent_count > 0 ? this.adjacent_count : '';
            }
        }
    };

    function revealMines() {
        for (let row of cells) {
            for (let cell of row) {
                if (cell.is_mine) {
                    const button = document.getElementById(cell.bid);
                    button.className = 'mine';
                    button.textContent = 'M';
                }
            }
        }
    }

    function checkWinCondition() {
        for (let row of cells) {
            for (let cell of row) {
                if (!cell.is_mine && !cell.is_exposed) {
                    return false;
                }
            }
        }
        return true;
    }

    function exposeCell(row, col) {
        const cell = cells[row][col];
        if (!cell.is_exposed) {
            cell.is_exposed = true;
            cell.show();
            if (cell.adjacent_count === 0 && !cell.is_mine) {
                for (let r = Math.max(row - 1, 0); r <= Math.min(row + 1, cells.length - 1); r++) {
                    for (let c = Math.max(col - 1, 0); c <= Math.min(col + 1, cells[0].length - 1); c++) {
                        if (r !== row || c !== col) {
                            exposeCell(r, c);
                        }
                    }
                }
            }
        }
    }

    function processClick(row, col) {
        if (!gameActive || cells[row][col].is_exposed) return;
        const cell = cells[row][col];
        if (firstClick) {
            firstClick = false;
            placeMinesAndCounts(row, col);
        }
        if (cell.is_mine) {
            cell.is_exposed = true;
            cell.show();
            gameActive = false;
            revealMines();
            alert('Game Over!');
        } else {
            exposeCell(row, col);
            if (checkWinCondition()) {
                alert('You Win!');
                gameActive = false;
            }
        }
    }

    function placeMinesAndCounts(firstRow, firstCol) {
        let mineCount = games[difficultySelector.value].mineCount;
        let placedMines = 0;
        while (placedMines < mineCount) {
            let row = Math.floor(Math.random() * cells.length);
            let col = Math.floor(Math.random() * cells[0].length);
            let cell = cells[row][col];
            if (!cell.is_mine && (row !== firstRow || col !== firstCol)) {
                cell.is_mine = true;
                placedMines++;
                // Update adjacent counts for surrounding cells
                for (let r = Math.max(row - 1, 0); r <= Math.min(row + 1, cells.length - 1); r++) {
                    for (let c = Math.max(col - 1, 0); c <= Math.min(col + 1, cells[0].length - 1); c++) {
                        if (!(r === row && c === col)) {
                            cells[r][c].adjacent_count += 1;
                        }
                    }
                }
            }
        }
    }

    function initializeCells(rowCount, columnCount) {
        cells = [];
        for (let row = 0; row < rowCount; row++) {
            cells[row] = [];
            for (let col = 0; col < columnCount; col++) {
                cells[row][col] = new Cell(row, col);
            }
        }
    }

    function newGrid() {
        const { rowCount, columnCount } = games[difficultySelector.value];
        gameGrid.style.gridTemplateColumns = `repeat(${columnCount}, 30px)`;
        gameGrid.innerHTML = '';
        cells.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const button = document.createElement('button');
                button.id = cell.bid;
                button.addEventListener('click', function() {
                    processClick(rowIndex, colIndex);
                });
                gameGrid.appendChild(button);
            });
        });
    }

    startButton.addEventListener('click', function() {
        const { rowCount, columnCount } = games[difficultySelector.value];
        initializeCells(rowCount, columnCount);
        newGrid();
        firstClick = true;
        gameActive = true;
    });
});
