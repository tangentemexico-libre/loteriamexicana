(function () {
    const CARD_IDS = Array.from({ length: 20 }, (_, index) => index + 1);
    const PREDEFINED_TABLES = Array.from({ length: 20 }, (_, tableIndex) => {
        const offset = (tableIndex * 7) % CARD_IDS.length;
        const rotated = [...CARD_IDS.slice(offset), ...CARD_IDS.slice(0, offset)];

        return rotated
            .filter((_, index) => index !== (tableIndex * 3) % 20)
            .slice(0, 16);
    });

    const cards = window.cardsManager.getAllCards();
    const cardsById = new Map(cards.map((card) => [card.id, card]));
    const tables = PREDEFINED_TABLES.map((ids, index) => ({
        index,
        label: `Tabla ${index + 1}`,
        cards: ids.map((id) => cardsById.get(id)).filter(Boolean)
    }));

    const els = {
        goToPlay: document.getElementById("go-to-play"),
        goToPlayBoth: document.getElementById("go-to-play-both"),
        goToSing: document.getElementById("go-to-sing"),
        playView: document.getElementById("play-view"),
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

    els.goToPlay.addEventListener("click", () => setMode("table"));
    els.goToPlayBoth.addEventListener("click", () => {
        setMode("both");
        resetSinger("combo");
    });
    if (els.goToSing) {
        els.goToSing.addEventListener("click", () => {
            setMode("sing");
            resetSinger("sing");
        });
    }
    if (els.playModeTable) {
        els.playModeTable.addEventListener("click", () => setMode("table"));
    }

    if (els.playModeSing) {
        els.playModeSing.addEventListener("click", () => {
            setMode("sing");
            resetSinger("sing");
        });
    }

    if (els.playModeBoth) {
        els.playModeBoth.addEventListener("click", () => {
            setMode("both");
            resetSinger("combo");
        });
    }

    if (els.backTable) {
        els.backTable.addEventListener("click", () => setMode("table"));
    }

    if (els.backSing) {
        els.backSing.addEventListener("click", () => setMode("table"));
    }

    if (els.backBoth) {
        els.backBoth.addEventListener("click", () => setMode("both"));
    }
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

    setMode("table");
    renderSinger("sing");
    renderSinger("combo");

    function setMode(mode) {
        state.mode = mode;
        els.playModeMenu.hidden = true;
        els.playTableMode.hidden = mode !== "table";
        els.playSingMode.hidden = mode !== "sing";
        els.playBothMode.hidden = mode !== "both";

        if (els.playView) {
            els.playView.classList.remove("board-active", "combo-active");
            
            const playTitleEl = els.playView.querySelector(".section-head h2");
            const playEyebrowEl = els.playView.querySelector(".section-head .eyebrow");
            if (playTitleEl && playEyebrowEl) {
                if (mode === "table") {
                    playEyebrowEl.textContent = "Opcion 1";
                    playTitleEl.textContent = "Jugar";
                } else if (mode === "sing") {
                    playEyebrowEl.textContent = "Opcion 3";
                    playTitleEl.textContent = "Cantar";
                } else if (mode === "both") {
                    playEyebrowEl.textContent = "Opcion 4";
                    playTitleEl.textContent = "Jugar y cantar";
                }
            }
        }

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

        if (els.playView) {
            if (hasTable) {
                els.playView.classList.add("board-active");
            } else {
                els.playView.classList.remove("board-active");
            }
        }

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

        if (els.playView) {
            if (hasTable) {
                els.playView.classList.add("combo-active");
            } else {
                els.playView.classList.remove("combo-active");
            }
        }

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

            const imageFrame = document.createElement("div");
            imageFrame.className = "play-card-image-frame";

            const img = document.createElement("img");
            img.src = card.image;
            img.alt = card.name;
            imageFrame.appendChild(img);

            const status = document.createElement("span");
            status.className = "play-card-mark";
            status.textContent = marks.has(card.id) ? "Palomeada" : "Toca para marcar";

            button.append(imageFrame, status);
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
            nameEl.style.display = "block";
            nameEl.textContent = "Las cartas se revolveran al iniciar.";
        } else {
            if (isCombo) {
                cardEl.innerHTML = `
                    <img src="${current.image}" alt="${escapeHtml(current.name)}">
                    <span class="current-call-hint">Toca para cantar la siguiente</span>
                `;
                nameEl.style.display = "block";
                nameEl.textContent = `${current.id}. ${current.name}`;
            } else {
                cardEl.innerHTML = `
                    <img src="${current.image}" alt="${escapeHtml(current.name)}">
                `;
                nameEl.style.display = "none";
                nameEl.textContent = "";
            }
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

    function escapeHtml(value) {
        return value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
    }
})();
