const carCanvas = document.getElementById("carCanvas"); 
carCanvas.width = 200;

const networkCanvas = document.getElementById("networkCanvas"); 
networkCanvas.width = 500; 

const carContext = carCanvas.getContext("2d");
const networkContext = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const N = 100;
const cars = generateCars(N);
let bestCar = cars[0];
// if there is a bestBrain already stored, use that
if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(
        localStorage.getItem("bestBrain"));
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.1);
        }
    }
}

function generateTraffic(road, count = 50) {
    const traffic = [];
    const laneCount = 3;
    let y = -100;

    for (let i = 0; i < count; i++) {
        const lane = Math.floor(Math.random() * laneCount);

        traffic.push(
            new Car(
                road.getLaneCenter(lane),
                y,
                30,
                50,
                "DUMMY",
                0.4 + Math.random() * 0.2 // speed variation
            )
        );

        y -= 100 + Math.random() * 200; // spacing
    }

    return traffic;
}

const traffic = generateTraffic(road, 50)

animate();

function save() {
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain)
    );
}

function discard() {
    localStorage.removeItem("bestBrain"); 
}

// parallelize process
function generateCars(N) {
    const cars = [];
    for (let i = 0; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

function animate(time) {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }
    bestCar = cars.find(
        c => c.y == Math.min( // create new array with only the y values of the cars
            ...cars.map(c => c.y) // spread the array because Math.min doesn't take arrays
        ));

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carContext.save();
    carContext.translate(0, -bestCar.y + carCanvas.height * 0.75);

    road.draw(carContext);
    // loop through all traffic cars and draw them on the canvas 
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carContext, "red");
    } 
    carContext.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carContext, "blue");
    }
    carContext.globalAlpha = 1;
    bestCar.draw(carContext, "blue", true)

    carContext.restore();

    networkContext.lineDashOffset = -time / 50
    Visualizer.drawNetwork(networkContext, bestCar.brain);
    requestAnimationFrame(animate);
}