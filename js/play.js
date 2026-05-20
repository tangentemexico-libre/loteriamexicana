(function () {
    const PREDEFINED_TABLES = [
        [1, 2, 3, 4, 10, 11, 12, 13, 19, 20, 21, 22, 28, 29, 30, 31],
        [6, 7, 8, 9, 15, 16, 17, 18, 24, 25, 26, 27, 33, 34, 35, 36],
        [2, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14, 15, 17, 18, 19, 20],
        [43, 44, 45, 21, 52, 53, 54, 26, 7, 8, 9, 31, 16, 17, 18, 36],
        [22, 23, 24, 25, 27, 28, 29, 30, 32, 33, 34, 35, 37, 38, 39, 40],
        [21, 22, 23, 24, 30, 31, 32, 33, 39, 40, 41, 42, 48, 49, 50, 51],
        [25, 26, 27, 41, 34, 35, 36, 46, 43, 44, 45, 51, 52, 53, 54, 32],
        [42, 43, 44, 45, 47, 48, 49, 50, 52, 53, 54, 1, 40, 10, 19, 30],
        [41, 42, 37, 38, 50, 51, 46, 47, 5, 6, 1, 2, 14, 15, 10, 11],
        [40, 23, 4, 5, 27, 28, 9, 30, 32, 13, 34, 35, 37, 18, 39, 22],
        [1, 2, 3, 4, 15, 16, 17, 18, 12, 13, 14, 54, 26, 27, 28, 36],
        [6, 7, 8, 9, 27, 28, 29, 30, 5, 36, 1, 2, 40, 10, 19, 31],
        [52, 53, 54, 32, 39, 40, 41, 42, 27, 28, 29, 30, 43, 44, 45, 21],
        [27, 41, 34, 35, 29, 30, 32, 33, 14, 15, 17, 18, 40, 23, 39, 22],
        [50, 51, 21, 22, 23, 24, 7, 8, 9, 10, 19, 20, 28, 29, 30, 31],
        [50, 52, 53, 54, 46, 43, 44, 45, 30, 32, 33, 34, 11, 12, 13, 19],
        [9, 10, 11, 12, 22, 23, 24, 25, 35, 36, 13, 38, 51, 1, 2, 3],
        [21, 23, 24, 25, 27, 28, 29, 30, 32, 33, 34, 35, 37, 38, 39, 41],
        [12, 43, 44, 45, 47, 48, 49, 50, 52, 53, 54, 1, 40, 10, 19, 20],
        [2, 3, 4, 5, 7, 8, 9, 11, 12, 13, 14, 15, 17, 18, 19, 53]
    ];

    const cards = window.cardsManager.getAllCards();
    const cardsById = new Map(cards.map((card) => [card.id, card]));
    const tables = PREDEFINED_TABLES.map((ids, index) => ({
        index,
        label: `Tabla ${index + 1}`,
        cards: ids.map((id) => cardsById.get(id)).filter(Boolean)
    }));

    const els = {
        goToPlay: document.getElementById("go-to-play"),
        playModeMenu: document.getElementById("play-mode-menu"),
        playTableMode: document.getElementById("play-table-mode"),
        playSingMode: document.getElementById("play-sing-mode"),
        playBothMode: document.getElementById("play-both-mode"),
        playModeTable: document.getElementById("play-mode-table"),
        playModeSing: document.getElementById("play-mode-sing"),
        playModeBoth: document.getElementById("play-mode-both"),
        backTable: document.getElementById("back-to-play-modes-from-table"),
        backSing: document.getElementById("back-to-play-modes-from-sing"),
        backBoth: document.getElementById("back-to-play-modes-from-both"),
        tableSelectionView: document.getElementById("table-selection-view"),
        tableBoardView: document.getElementById("table-board-view"),
        tablePickerGrid: document.getElementById("table-picker-grid"),
        selectedTableTitle: document.getElementById("selected-table-title"),
        selectedTableBoard: document.getElementById("selected-table-board"),
        changeSelectedTable: document.getElementById("change-selected-table"),
        currentCallCard: document.getElementById("current-call-card"),
        currentCallName: document.getElementById("current-call-name"),
        calledCount: document.getElementById("called-count"),
        restartSinging: document.getElementById("restart-singing"),
        calledCardsStrip: document.getElementById("called-cards-strip"),
        comboSelectionView: document.getElementById("combo-selection-view"),
        comboBoardView: document.getElementById("combo-board-view"),
        comboTablePickerGrid: document.getElementById("combo-table-picker-grid"),
        comboTableTitle: document.getElementById("combo-table-title"),
        comboSelectedTableBoard: document.getElementById("combo-selected-table-board"),
        changeComboTable: document.getElementById("change-combo-table"),
        comboCurrentCallCard: document.getElementById("combo-current-call-card"),
        comboCurrentCallName: document.getElementById("combo-current-call-name"),
        comboCalledCount: document.getElementById("combo-called-count"),
        restartComboSinging: document.getElementById("restart-combo-singing"),
        comboCalledCardsStrip: document.getElementById("combo-called-cards-strip")
    };

    const state = {
        mode: null,
        tableIndex: null,
        comboTableIndex: null,
        tableMarks: new Set(),
        comboMarks: new Set(),
        singDeck: [],
        singIndex: -1,
        comboDeck: [],
        comboIndex: -1
    };

    els.goToPlay.addEventListener("click", () => setMode(null));
    els.playModeTable.addEventListener("click", () => setMode("table"));
    els.playModeSing.addEventListener("click", () => {
        setMode("sing");
        resetSinger("sing");
    });
    els.playModeBoth.addEventListener("click", () => {
        setMode("both");
        resetSinger("combo");
    });
    els.backTable.addEventListener("click", () => setMode(null));
    els.backSing.addEventListener("click", () => setMode(null));
    els.backBoth.addEventListener("click", () => setMode(null));
    els.changeSelectedTable.addEventListener("click", () => {
        state.tableIndex = null;
        state.tableMarks = new Set();
        renderTableMode();
    });
    els.changeComboTable.addEventListener("click", () => {
        state.comboTableIndex = null;
        state.comboMarks = new Set();
        renderBothMode();
    });
    els.currentCallCard.addEventListener("click", () => advanceSinger("sing"));
    els.comboCurrentCallCard.addEventListener("click", () => advanceSinger("combo"));
    els.restartSinging.addEventListener("click", () => resetSinger("sing"));
    els.restartComboSinging.addEventListener("click", () => resetSinger("combo"));

    renderTablePicker(els.tablePickerGrid, (index) => {
        state.tableIndex = index;
        state.tableMarks = new Set();
        renderTableMode();
    });

    renderTablePicker(els.comboTablePickerGrid, (index) => {
        state.comboTableIndex = index;
        state.comboMarks = new Set();
        renderBothMode();
    });

    setMode(null);
    renderSinger("sing");
    renderSinger("combo");

    function setMode(mode) {
        state.mode = mode;
        els.playModeMenu.hidden = mode !== null;
        els.playTableMode.hidden = mode !== "table";
        els.playSingMode.hidden = mode !== "sing";
        els.playBothMode.hidden = mode !== "both";

        if (mode === "table") {
            renderTableMode();
        }

        if (mode === "both") {
            renderBothMode();
        }
    }

    function renderTablePicker(container, onSelect) {
        container.innerHTML = "";

        tables.forEach((table, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "table-picker-card";
            button.addEventListener("click", () => onSelect(index));

            const title = document.createElement("strong");
            title.textContent = table.label;

            const meta = document.createElement("span");
            meta.textContent = "4 x 4 predefinida";

            const preview = document.createElement("div");
            preview.className = "table-picker-preview";

            table.cards.slice(0, 4).forEach((card) => {
                const img = document.createElement("img");
                img.src = card.image;
                img.alt = card.name;
                preview.appendChild(img);
            });

            button.append(title, meta, preview);
            container.appendChild(button);
        });
    }

    function renderTableMode() {
        const hasTable = state.tableIndex !== null;
        els.tableSelectionView.hidden = hasTable;
        els.tableBoardView.hidden = !hasTable;

        if (!hasTable) {
            return;
        }

        const table = tables[state.tableIndex];
        els.selectedTableTitle.textContent = `${table.label} lista para jugar`;
        renderBoard(els.selectedTableBoard, table.cards, state.tableMarks, "table");
    }

    function renderBothMode() {
        const hasTable = state.comboTableIndex !== null;
        els.comboSelectionView.hidden = hasTable;
        els.comboBoardView.hidden = !hasTable;

        if (!hasTable) {
            return;
        }

        const table = tables[state.comboTableIndex];
        els.comboTableTitle.textContent = `${table.label} en juego`;
        renderBoard(els.comboSelectedTableBoard, table.cards, state.comboMarks, "combo");
    }

    function renderBoard(container, tableCards, marks, scope) {
        container.innerHTML = "";

        const grid = document.createElement("div");
        grid.className = "play-table-grid";

        tableCards.forEach((card) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "play-card";
            button.dataset.marked = marks.has(card.id) ? "true" : "false";
            button.addEventListener("click", () => toggleMark(card.id, scope));

            const img = document.createElement("img");
            img.src = card.image;
            img.alt = card.name;

            const title = document.createElement("span");
            title.className = "play-card-title";
            title.textContent = `${card.id}. ${sanitizeName(card.name)}`;

            const status = document.createElement("span");
            status.className = "play-card-mark";
            status.textContent = marks.has(card.id) ? "Palomeada" : "Toca para marcar";

            button.append(img, title, status);
            grid.appendChild(button);
        });

        container.appendChild(grid);
    }

    function toggleMark(cardId, scope) {
        const marks = scope === "combo" ? state.comboMarks : state.tableMarks;

        if (marks.has(cardId)) {
            marks.delete(cardId);
        } else {
            marks.add(cardId);
        }

        if (scope === "combo") {
            renderBothMode();
        } else {
            renderTableMode();
        }
    }

    function resetSinger(scope) {
        const deck = shuffle([...cards]);

        if (scope === "combo") {
            state.comboDeck = deck;
            state.comboIndex = -1;
        } else {
            state.singDeck = deck;
            state.singIndex = -1;
        }

        renderSinger(scope);
    }

    function advanceSinger(scope) {
        const deck = scope === "combo" ? state.comboDeck : state.singDeck;
        const index = scope === "combo" ? state.comboIndex : state.singIndex;

        if (!deck.length) {
            resetSinger(scope);
            return;
        }

        const next = Math.min(index + 1, deck.length - 1);

        if (scope === "combo") {
            state.comboIndex = next;
        } else {
            state.singIndex = next;
        }

        renderSinger(scope);
    }

    function renderSinger(scope) {
        const isCombo = scope === "combo";
        const deck = isCombo ? state.comboDeck : state.singDeck;
        const index = isCombo ? state.comboIndex : state.singIndex;
        const current = index >= 0 ? deck[index] : null;
        const history = index > 0 ? deck.slice(0, index) : [];
        const cardEl = isCombo ? els.comboCurrentCallCard : els.currentCallCard;
        const nameEl = isCombo ? els.comboCurrentCallName : els.currentCallName;
        const countEl = isCombo ? els.comboCalledCount : els.calledCount;
        const stripEl = isCombo ? els.comboCalledCardsStrip : els.calledCardsStrip;

        countEl.textContent = `${Math.max(0, index + 1)} / ${cards.length}`;
        stripEl.innerHTML = "";

        if (!current) {
            cardEl.innerHTML = `<span class="current-call-empty">Toca para iniciar el canto</span>`;
            nameEl.textContent = "Las cartas se revolveran al iniciar.";
        } else {
            cardEl.innerHTML = `
                <img src="${current.image}" alt="${escapeHtml(sanitizeName(current.name))}">
                <span class="current-call-hint">Toca para cantar la siguiente</span>
            `;
            nameEl.textContent = `${current.id}. ${sanitizeName(current.name)}`;
        }

        history.forEach((card) => {
            const thumb = document.createElement("div");
            thumb.className = "called-thumb";

            const img = document.createElement("img");
            img.src = card.image;
            img.alt = card.name;

            thumb.appendChild(img);
            stripEl.appendChild(thumb);
        });
    }

    function shuffle(list) {
        for (let i = list.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }

        return list;
    }

    function sanitizeName(value) {
        return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function escapeHtml(value) {
        return value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
    }
})();
