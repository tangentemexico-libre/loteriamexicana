(function () {
    const jsPDF = window.jspdf && window.jspdf.jsPDF;
    const cards = window.cardsManager.getAllCards();

    const form = document.getElementById("generator-form");
    const tableCountInput = document.getElementById("table-count");
    const rowCountInput = document.getElementById("row-count");
    const colCountInput = document.getElementById("col-count");
    const tablesContainer = document.getElementById("tables-container");
    const statusMessage = document.getElementById("status-message");
    const previewSummary = document.getElementById("preview-summary");
    const openPdfButton = document.getElementById("open-pdf-config");
    const pdfDialog = document.getElementById("pdf-dialog");
    const pdfForm = document.getElementById("pdf-form");
    const cancelPdfButton = document.getElementById("cancel-pdf");

    const state = {
        tables: [],
        rows: 4,
        cols: 4
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const tableCount = normalizeNumber(tableCountInput.value, 1, 200, 4);
        const rows = normalizeNumber(rowCountInput.value, 2, 8, 4);
        const cols = normalizeNumber(colCountInput.value, 2, 8, 4);
        const cardsPerTable = rows * cols;

        if (cardsPerTable > cards.length) {
            statusMessage.textContent = `No se pueden generar tablas de ${rows}x${cols}. Solo hay ${cards.length} cartas disponibles.`;
            return;
        }

        state.tables = Array.from({ length: tableCount }, () => createTableData(cardsPerTable));
        state.rows = rows;
        state.cols = cols;

        renderTables();

        statusMessage.textContent = `Se generaron ${tableCount} tablas de ${rows}x${cols}.`;
        previewSummary.textContent = `${tableCount} tablas listas para vista previa y PDF.`;
        openPdfButton.disabled = false;
    });

    openPdfButton.addEventListener("click", () => {
        if (!state.tables.length) {
            return;
        }

        pdfDialog.showModal();
    });

    cancelPdfButton.addEventListener("click", () => {
        pdfDialog.close();
    });

    pdfForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const size = new FormData(pdfForm).get("pdf-size");
        pdfDialog.close();
        openPdfButton.disabled = true;
        statusMessage.textContent = "Preparando PDF...";

        try {
            if (jsPDF) {
                await exportPdf(size);
                statusMessage.textContent = "PDF generado correctamente.";
            } else {
                exportPrintView(size);
                statusMessage.textContent = "Se abrio la vista para guardar como PDF desde imprimir.";
            }
        } catch (error) {
            console.error(error);
            statusMessage.textContent = "No fue posible generar el PDF.";
        } finally {
            openPdfButton.disabled = false;
        }
    });

    function normalizeNumber(value, min, max, fallback) {
        const parsed = Number.parseInt(value, 10);

        if (Number.isNaN(parsed)) {
            return fallback;
        }

        return Math.min(max, Math.max(min, parsed));
    }

    function createTableData(cardsPerTable) {
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, cardsPerTable);
    }

    function renderTables() {
        tablesContainer.innerHTML = "";

        state.tables.forEach((tableCards, index) => {
            const article = document.createElement("article");
            article.className = "table-card";

            const title = document.createElement("h3");
            title.textContent = `Tabla ${index + 1}`;
            article.appendChild(title);

            const grid = document.createElement("div");
            grid.className = "table-grid";
            grid.style.gridTemplateColumns = `repeat(${state.cols}, minmax(0, 1fr))`;

            tableCards.forEach((card) => {
                const cell = document.createElement("div");
                cell.className = "lottery-cell";

                const img = document.createElement("img");
                img.src = card.image;
                img.alt = card.name;

                cell.appendChild(img);
                grid.appendChild(cell);
            });

            article.appendChild(grid);
            tablesContainer.appendChild(article);
        });
    }

    async function exportPdf(size) {
        const layout = getLayout(size);
        const pdf = new jsPDF({
            orientation: layout.orientation,
            unit: "mm",
            format: "letter"
        });
        const imageCache = await buildImageCache();

        for (let index = 0; index < state.tables.length; index += 1) {
            if (index > 0 && index % layout.perPage === 0) {
                pdf.addPage("letter", layout.orientation);
            }

            const slotIndex = index % layout.perPage;
            drawTableOnPdf(pdf, state.tables[index], index + 1, layout.slots[slotIndex], imageCache);
        }

        pdf.save(`tablas-loteria-${state.rows}x${state.cols}.pdf`);
    }

    function exportPrintView(size) {
        const layout = getPrintLayout(size);
        const metrics = getPrintMetrics(layout);
        const printWindow = window.open("", "_blank", "width=1200,height=900");

        if (!printWindow) {
            throw new Error("No fue posible abrir la ventana de impresion.");
        }

        const sheetsHtml = wrapPrintSheets(layout.perPage, metrics);

        printWindow.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <base href="${window.location.href}">
    <title>Tablas de loteria</title>
    <style>
        @page { size: letter ${layout.orientationCss}; margin: ${asMm(layout.pageMargin)}; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Arial, sans-serif; color: #2d2015; }
        .sheet {
            display: grid;
            grid-template-columns: repeat(${layout.columns}, 1fr);
            grid-template-rows: repeat(${layout.rows}, 1fr);
            gap: ${asMm(layout.gap)};
            page-break-after: always;
            height: ${asMm(metrics.contentHeight)};
            align-items: stretch;
        }
        .sheet:last-child { page-break-after: auto; }
        .table-card {
            border: 1px solid #bfa58a;
            border-radius: 4mm;
            padding: ${asMm(layout.cardPadding)};
            break-inside: avoid;
            min-height: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .table-title { margin: 0 0 ${asMm(layout.titleGap)}; font-size: ${layout.titleSizePt}pt; font-weight: 700; line-height: 1; }
        .table-grid-wrap {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 0;
        }
        .table-grid {
            display: grid;
            gap: ${asMm(layout.cellGap)};
            width: ${asMm(metrics.gridWidth)};
            height: ${asMm(metrics.gridHeight)};
            grid-template-columns: repeat(${state.cols}, ${asMm(metrics.cellWidth)});
            grid-template-rows: repeat(${state.rows}, ${asMm(metrics.cellHeight)});
        }
        .cell { border: 1px solid #ddc9af; border-radius: 2mm; padding: ${asMm(layout.cellPadding)}; background: #fffaf4; width: 100%; height: 100%; }
        .cell img { width: 100%; height: 100%; object-fit: contain; display: block; border-radius: 1.5mm; background: #fff; }
    </style>
</head>
<body>${sheetsHtml}</body>
</html>`);
        printWindow.document.close();

        waitForPrintImages(printWindow).then(() => {
            printWindow.focus();
            printWindow.print();
        });
    }

    function getPrintLayout(size) {
        if (size === "half") {
            return {
                perPage: 2,
                columns: 2,
                rows: 1,
                orientationCss: "landscape",
                pageWidth: 279,
                pageHeight: 216,
                gap: 3,
                pageMargin: 5,
                cardPadding: 2,
                cellGap: 1.2,
                cellPadding: 0.8,
                titleGap: 1.2,
                titleSizePt: 10,
                titleHeight: 5
            };
        }

        if (size === "quarter") {
            return {
                perPage: 4,
                columns: 2,
                rows: 2,
                orientationCss: "portrait",
                pageWidth: 216,
                pageHeight: 279,
                gap: 2,
                pageMargin: 3,
                cardPadding: 1.2,
                cellGap: 0.8,
                cellPadding: 0.5,
                titleGap: 0.8,
                titleSizePt: 8.5,
                titleHeight: 4
            };
        }

        return {
            perPage: 1,
            columns: 1,
            rows: 1,
            orientationCss: "portrait",
            pageWidth: 216,
            pageHeight: 279,
            gap: 0,
            pageMargin: 8,
            cardPadding: 3,
            cellGap: 2,
            cellPadding: 1.5,
            titleGap: 3,
            titleSizePt: 12,
            titleHeight: 6
        };
    }

    function getPrintMetrics(layout) {
        const contentWidth = layout.pageWidth - layout.pageMargin * 2;
        const contentHeight = layout.pageHeight - layout.pageMargin * 2;
        const slotWidth = (contentWidth - layout.gap * (layout.columns - 1)) / layout.columns;
        const slotHeight = (contentHeight - layout.gap * (layout.rows - 1)) / layout.rows;
        const innerWidth = slotWidth - layout.cardPadding * 2;
        const innerHeight = slotHeight - layout.cardPadding * 2;
        const gridWidthLimit = innerWidth;
        const gridHeightLimit = innerHeight - layout.titleHeight - layout.titleGap;
        const cellWidthByWidth = (gridWidthLimit - layout.cellGap * (state.cols - 1)) / state.cols;
        const cellHeightByHeight = (gridHeightLimit - layout.cellGap * (state.rows - 1)) / state.rows;
        const cardAspect = 0.72;
        const cellWidthByHeight = cellHeightByHeight * cardAspect;
        const cellWidth = Math.min(cellWidthByWidth, cellWidthByHeight);
        const cellHeight = cellWidth / cardAspect;
        const gridWidth = cellWidth * state.cols + layout.cellGap * (state.cols - 1);
        const gridHeight = cellHeight * state.rows + layout.cellGap * (state.rows - 1);

        return {
            contentWidth,
            contentHeight,
            slotWidth,
            slotHeight,
            cellWidth,
            cellHeight,
            gridWidth,
            gridHeight
        };
    }

    function wrapPrintSheets(perPage, metrics) {
        const chunks = [];

        for (let index = 0; index < state.tables.length; index += perPage) {
            const start = index;
            const end = Math.min(index + perPage, state.tables.length);
            const html = state.tables
                .slice(start, end)
                .map((tableCards, chunkIndex) => renderPrintableTable(tableCards, start + chunkIndex + 1, metrics))
                .join("");
            chunks.push(`<section class="sheet">${html}</section>`);
        }

        return chunks.join("");
    }

    function waitForPrintImages(printWindow) {
        return new Promise((resolve) => {
            const images = Array.from(printWindow.document.images);

            if (!images.length) {
                resolve();
                return;
            }

            let pending = images.length;
            const finish = () => {
                pending -= 1;

                if (pending <= 0) {
                    setTimeout(resolve, 150);
                }
            };

            images.forEach((image) => {
                if (image.complete) {
                    finish();
                    return;
                }

                image.addEventListener("load", finish, { once: true });
                image.addEventListener("error", finish, { once: true });
            });

            setTimeout(resolve, 3000);
        });
    }

    function renderPrintableTable(tableCards, tableNumber, metrics) {
        const cells = tableCards
            .map((card) => `
                <div class="cell">
                    <img src="${card.image}" alt="${escapeHtml(card.name)}">
                </div>
            `)
            .join("");

        return `
            <article class="table-card" style="width:${asMm(metrics.slotWidth)};height:${asMm(metrics.slotHeight)};">
                <h2 class="table-title">Tabla ${tableNumber}</h2>
                <div class="table-grid-wrap">
                    <div class="table-grid">${cells}</div>
                </div>
            </article>
        `;
    }

    function asMm(value) {
        return `${value}mm`;
    }

    function escapeHtml(value) {
        return value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
    }

    function getLayout(size) {
        if (size === "half") {
            return {
                orientation: "landscape",
                perPage: 2,
                slots: [
                    { x: 12, y: 12, w: 124.75, h: 192 },
                    { x: 142.25, y: 12, w: 124.75, h: 192 }
                ]
            };
        }

        if (size === "quarter") {
            return {
                orientation: "portrait",
                perPage: 4,
                slots: [
                    { x: 12, y: 12, w: 93, h: 124.75 },
                    { x: 111, y: 12, w: 93, h: 124.75 },
                    { x: 12, y: 142.25, w: 93, h: 124.75 },
                    { x: 111, y: 142.25, w: 93, h: 124.75 }
                ]
            };
        }

        return {
            orientation: "portrait",
            perPage: 1,
            slots: [
                { x: 12, y: 12, w: 192, h: 255 }
            ]
        };
    }

    async function buildImageCache() {
        const pairs = await Promise.all(cards.map(async (card) => [card.id, await loadImageAsDataUrl(card.image)]));
        return new Map(pairs);
    }

    function loadImageAsDataUrl(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/jpeg", 0.92));
            };
            img.onerror = () => reject(new Error(`No fue posible cargar ${src}`));
            img.src = src;
        });
    }

    function drawTableOnPdf(pdf, tableCards, tableNumber, slot, imageCache) {
        const titleHeight = 10;
        const innerPadding = 4;
        const gridTop = slot.y + titleHeight + innerPadding;
        const availableWidth = slot.w - innerPadding * 2;
        const availableHeight = slot.h - titleHeight - innerPadding * 2;
        const cellWidth = availableWidth / state.cols;
        const cellHeight = availableHeight / state.rows;
        const imageHeight = Math.max(14, cellHeight - 3);

        pdf.setDrawColor(190, 163, 130);
        pdf.setLineWidth(0.4);
        pdf.roundedRect(slot.x, slot.y, slot.w, slot.h, 3, 3);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(`Tabla ${tableNumber}`, slot.x + innerPadding, slot.y + 6.5);

        tableCards.forEach((card, index) => {
            const row = Math.floor(index / state.cols);
            const col = index % state.cols;
            const cellX = slot.x + innerPadding + col * cellWidth;
            const cellY = gridTop + row * cellHeight;
            const imageWidth = cellWidth - 3;
            const drawWidth = Math.min(imageWidth, imageHeight * 0.72);
            const imageX = cellX + (cellWidth - drawWidth) / 2;
            const imageY = cellY + Math.max(1.5, (cellHeight - imageHeight) / 2);

            pdf.setFillColor(255, 250, 244);
            pdf.roundedRect(cellX, cellY, cellWidth - 1.5, cellHeight - 1.5, 1.5, 1.5, "FD");
            pdf.addImage(imageCache.get(card.id), "JPEG", imageX, imageY, drawWidth, imageHeight);
        });
    }
})();
