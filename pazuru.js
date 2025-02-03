const container = document.getElementById('puzzle-container');
const shuffleBtn = document.getElementById('shuffle-btn');
const timeDisplay = document.getElementById('time');
const moveCountDisplay = document.getElementById('moves');
const levelSelect = document.getElementById('level');
const themeToggle = document.getElementById('theme-toggle');
const rankingContainer = document.getElementById('ranking-container');  // ランキング表示用のコンテナ
const resetRankingBtn = document.getElementById('reset-ranking-btn');  // 順位リセットボタン

let size = 5, tiles = [], moveCount = 0, timerInterval, startTime, draggedTile = null;

function initTiles() {
    size = parseInt(levelSelect.value);
    tiles = Array.from({ length: size * size }, (_, i) => i + 1);
    tiles[size * size - 1] = 0;
    moveCount = 0;
    updateDisplays();
    renderTiles();
    resetTimer();

    // 5秒後に自動でシャッフル
    setTimeout(shuffleTiles, 5000);  // 5000ミリ秒後（5秒後）にシャッフルを実行
}

function renderTiles() {
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${size}, 100px)`;
    tiles.forEach((tile, index) => {
        const div = document.createElement('div');
        div.className = 'tile';
        div.draggable = tile !== 0;
        div.dataset.index = index;
        if (tile) div.style.backgroundImage = `url('日本列島.png')`;
        div.style.backgroundPosition = `${-((tile - 1) % size) * 100}px ${-Math.floor((tile - 1) / size) * 100}px`;
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);
        div.addEventListener('dragover', handleDragOver);
        div.addEventListener('drop', (e) => handleDrop(e, index));
        div.addEventListener('click', () => swapTiles(index));
        container.appendChild(div);
    });
}

function handleDragStart(e) { draggedTile = e.target; }
function handleDragEnd() { draggedTile = null; }
function handleDragOver(e) { e.preventDefault(); }

function handleDrop(e, targetIndex) {
    e.preventDefault();
    if (draggedTile) swapTiles(draggedTile.dataset.index, targetIndex);
}

function swapTiles(index1, index2) {
    index1 = parseInt(index1);
    index2 = parseInt(index2);
    if (isAdjacent(index1, index2)) {
        [tiles[index1], tiles[index2]] = [tiles[index2], tiles[index1]];
        moveCount++;
        updateDisplays();
        renderTiles();
        checkWin();
    }
}

function isAdjacent(index1, index2) {
    const [row1, col1] = [Math.floor(index1 / size), index1 % size];
    const [row2, col2] = [Math.floor(index2 / size), index2 % size];
    return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
}

function checkWin() {
    if (tiles.join('') === [...Array(size * size - 1)].map((_, i) => i + 1).concat(0).join('')) {
        clearInterval(timerInterval);
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        alert(`おめでとう！所要時間: ${timeTaken}秒, 動き: ${moveCount}回`);
        saveScore(timeTaken, moveCount);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    startTime = Date.now();
    timeDisplay.textContent = '0';
    timerInterval = setInterval(() => timeDisplay.textContent = Math.floor((Date.now() - startTime) / 1000), 1000);
}

function updateDisplays() { moveCountDisplay.textContent = moveCount; }

function shuffleTiles() {
    // シャッフルの処理を実装
    let shuffledTiles = [...tiles];
    // 空のタイル(0)を除外してシャッフル
    shuffledTiles = shuffledTiles.filter(tile => tile !== 0).sort(() => Math.random() - 0.5);
    // 空のタイル(0)を最後に戻す
    shuffledTiles.push(0);
    tiles = shuffledTiles;

    renderTiles();
    resetTimer();
}

function saveScore(time, moves) {
    let scores = JSON.parse(localStorage.getItem('puzzleScores')) || [];//ローカルストレージ
    scores.push({ time, moves });
    scores.sort((a, b) => a.time - b.time || a.moves - b.moves);  // タイムと動きでソート
    if (scores.length > 10) scores.pop();  // 上位10件だけ保存
    localStorage.setItem('puzzleScores', JSON.stringify(scores));
    displayRanking();
}

function displayRanking() {
    const scores = JSON.parse(localStorage.getItem('puzzleScores')) || [];
    rankingContainer.innerHTML = '<h2>ランキング</h2>';

    // ランキングが空の場合に表示を工夫
    if (scores.length === 0) {
        rankingContainer.innerHTML += '<p>まだランキングはありません。</p>';
    } else {
        scores.forEach((score, index) => {
            const scoreDiv = document.createElement('div');
            scoreDiv.textContent = `順位 ${index + 1}: ${score.time}秒, ${score.moves}回`;
            rankingContainer.appendChild(scoreDiv);
        });
    }
}

function initRankingContainer() {
    // CSSのスタイルを設定してスクロール可能にする
    rankingContainer.style.maxHeight = '300px';
    rankingContainer.style.overflowY = 'auto';
}

// 順位リセットボタンのイベント処理
resetRankingBtn.addEventListener('click', () => {
    // ローカルストレージからランキングを削除
    localStorage.removeItem('puzzleScores');
    // ランキングを再表示
    displayRanking();
});

// レベル選択変更時にタイルをリセット
levelSelect.addEventListener('change', initTiles);

// シャッフルボタンがクリックされた時にシャッフル処理を実行
shuffleBtn.addEventListener('click', shuffleTiles);

initTiles();
initRankingContainer();  // ランキングコンテナの初期化
displayRanking();  // ページロード時にランキングを表示
