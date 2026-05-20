const CARDS_CONFIG = {
    totalCards: 54,
    fallbackCards: [
        { id: 1, name: "El Gallo", image: "./img/cartas/1.jpg" },
        { id: 2, name: "La Paloma", image: "./img/cartas/2.jpg" },
        { id: 3, name: "La Dama", image: "./img/cartas/3.jpg" },
        { id: 4, name: "El Catrín", image: "./img/cartas/4.jpg" },
        { id: 5, name: "El Paraguas", image: "./img/cartas/5.jpg" },
        { id: 6, name: "La Gallina", image: "./img/cartas/6.jpg" },
        { id: 7, name: "La Escalera", image: "./img/cartas/7.jpg" },
        { id: 8, name: "La Botella", image: "./img/cartas/8.jpg" },
        { id: 9, name: "El Barril", image: "./img/cartas/9.jpg" },
        { id: 10, name: "El Árbol", image: "./img/cartas/10.jpg" },
        { id: 11, name: "El Melón", image: "./img/cartas/11.jpg" },
        { id: 12, name: "El Bombero", image: "./img/cartas/12.jpg" },
        { id: 13, name: "El Gorrito", image: "./img/cartas/13.jpg" },
        { id: 14, name: "El Peluche", image: "./img/cartas/14.jpg" },
        { id: 15, name: "La Pera", image: "./img/cartas/15.jpg" },
        { id: 16, name: "La Bandera", image: "./img/cartas/16.jpg" },
        { id: 17, name: "El Bandolón", image: "./img/cartas/17.jpg" },
        { id: 18, name: "El Violoncello", image: "./img/cartas/18.jpg" },
        { id: 19, name: "La Garza", image: "./img/cartas/19.jpg" },
        { id: 20, name: "El Pájaro", image: "./img/cartas/20.jpg" },
        { id: 21, name: "La Mano", image: "./img/cartas/21.jpg" },
        { id: 22, name: "La Bota", image: "./img/cartas/22.jpg" },
        { id: 23, name: "La Luna", image: "./img/cartas/23.jpg" },
        { id: 24, name: "El Cotorro", image: "./img/cartas/24.jpg" },
        { id: 25, name: "El Policia", image: "./img/cartas/25.jpg" },
        { id: 26, name: "El Alfarero", image: "./img/cartas/26.jpg" },
        { id: 27, name: "El Corazón", image: "./img/cartas/27.jpg" },
        { id: 28, name: "La Sandia", image: "./img/cartas/28.jpg" },
        { id: 29, name: "El Tambor", image: "./img/cartas/29.jpg" },
        { id: 30, name: "El Camarón", image: "./img/cartas/30.jpg" },
        { id: 31, name: "Las Jarás", image: "./img/cartas/31.jpg" },
        { id: 32, name: "El Músico", image: "./img/cartas/32.jpg" },
        { id: 33, name: "La Arana", image: "./img/cartas/33.jpg" },
        { id: 34, name: "El Soldado", image: "./img/cartas/34.jpg" },
        { id: 35, name: "La Estrella", image: "./img/cartas/35.jpg" },
        { id: 36, name: "El Cazo", image: "./img/cartas/36.jpg" },
        { id: 37, name: "El Mundo", image: "./img/cartas/37.jpg" },
        { id: 38, name: "El Apache", image: "./img/cartas/38.jpg" },
        { id: 39, name: "El Nopal", image: "./img/cartas/39.jpg" },
        { id: 40, name: "El Alacrán", image: "./img/cartas/40.jpg" },
        { id: 41, name: "La Rosa", image: "./img/cartas/41.jpg" },
        { id: 42, name: "La Pizza", image: "./img/cartas/42.jpg" },
        { id: 43, name: "La Campana", image: "./img/cartas/43.jpg" },
        { id: 44, name: "El Cantarito", image: "./img/cartas/44.jpg" },
        { id: 45, name: "El Venado", image: "./img/cartas/45.jpg" },
        { id: 46, name: "El Sol", image: "./img/cartas/46.jpg" },
        { id: 47, name: "La Corona", image: "./img/cartas/47.jpg" },
        { id: 48, name: "La Chalupa", image: "./img/cartas/48.jpg" },
        { id: 49, name: "El Pino", image: "./img/cartas/49.jpg" },
        { id: 50, name: "El Pescado", image: "./img/cartas/50.jpg" },
        { id: 51, name: "La Palma", image: "./img/cartas/51.jpg" },
        { id: 52, name: "La Maceta", image: "./img/cartas/52.jpg" },
        { id: 53, name: "El Arpa", image: "./img/cartas/53.jpg" },
        { id: 54, name: "La Rana", image: "./img/cartas/54.jpg" }
    ]
};

class CardsManager {
    constructor() {
        this.cards = [...CARDS_CONFIG.fallbackCards];
    }

    getAllCards() {
        return [...this.cards];
    }

    getRandomCardsForTable(count) {
        const shuffled = [...this.cards].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }
}

window.CARDS_CONFIG = CARDS_CONFIG;
window.cardsManager = new CardsManager();
