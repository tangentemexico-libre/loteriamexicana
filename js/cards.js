const CARDS_CONFIG = {
    totalCards: 20,
    fallbackCards: [
        { id: 1, name: "La Cigüeña", image: "./img/cartas/1.jpg" },
        { id: 2, name: "El Biberón", image: "./img/cartas/2.jpg" },
        { id: 3, name: "El Osito", image: "./img/cartas/3.jpg" },
        { id: 4, name: "La Sonaja", image: "./img/cartas/4.jpg" },
        { id: 5, name: "Los Zapatitos", image: "./img/cartas/5.jpg" },
        { id: 6, name: "El Pañal", image: "./img/cartas/6.jpg" },
        { id: 7, name: "La Cuna", image: "./img/cartas/7.jpg" },
        { id: 8, name: "El Carrito", image: "./img/cartas/8.jpg" },
        { id: 9, name: "El Chupón", image: "./img/cartas/9.jpg" },
        { id: 10, name: "El Babero", image: "./img/cartas/10.jpg" },
        { id: 11, name: "El Mameluco", image: "./img/cartas/11.jpg" },
        { id: 12, name: "La Nube", image: "./img/cartas/12.jpg" },
        { id: 13, name: "La Luna", image: "./img/cartas/13.jpg" },
        { id: 14, name: "La Estrella", image: "./img/cartas/14.jpg" },
        { id: 15, name: "El Patito", image: "./img/cartas/15.jpg" },
        { id: 16, name: "El Elefantito", image: "./img/cartas/16.jpg" },
        { id: 17, name: "El Conejito", image: "./img/cartas/17.jpg" },
        { id: 18, name: "Los Bloques", image: "./img/cartas/18.jpg" },
        { id: 19, name: "Los Globos", image: "./img/cartas/19.jpg" },
        { id: 20, name: "El Regalo", image: "./img/cartas/20.jpg" }
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
