class Car {
    // constructor = special JS method to declare an object. use this. to assign properties to the new instance
    constructor(x, y, width, height, controlType, maxSpeed = 1) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.1;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05; 
        this.angle = 0;
        this.damaged = false;

        this.useBrain = controlType === "AI";

        if (controlType != "DUMMY") {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork(
                [
                    this.sensor.rayCount, // input layers
                    6, // one hidden layer with 6 neurons
                    4 // one output layer with 4 neurons
                ]
            );
        }
        this.controls = new Controls(controlType);
    }

    update(roadBorders, traffic) {
        if (!this.damaged) {
            this.#move();
            this.carContainer = this.#createCar();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }
        if (this.sensor) {
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.readings.map(
                e => e==null? 0 // no reading. sensor goes to max length and doesn't read anything
                :
                1 - e.offset // offset is num between 0 -> 1. doing 1 minus the offset makes flips the scale so that close objects have strong signals and far objects have weak signals.
                // e.g. e.offset = 0 (very close), but 1 - e.offset = 1 (very close)
            );
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            if (this.useBrain) {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.backward = outputs[3];
            }
        }
    }

    #assessDamage(roadBorders, traffic) {
        // loop through all borders
        for (let i = 0; i < roadBorders.length; i++) {
            // if there is an intersection between the car and the current container being inspected, return true
            if (containerIntersect(this.carContainer, roadBorders[i])) {
                return true;
            }
        }
        // loop through all traffic
        for (let i = 0; i < traffic.length; i++) {
            // if there is an intersection between the car and the current traffic car being inspected, return true
            if (containerIntersect(this.carContainer, traffic[i].carContainer)) {
                return true;
            }
        }
        return false; // if code reaches here, no intersections
    }

    #createCar() {
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });

        return points;
    }

    #move() {
        if (this.controls.forward) {
            this.speed += this.acceleration
        }
        if (this.controls.backward) {
            this.speed -= this.acceleration;
        } 
        if (this.speed != 0) {
            const flip = this.speed > 0? 1 : -1;
            if (this.controls.left) {
                this.angle += 0.01 * flip;
            }
            if (this.controls.right) {
                this.angle -= 0.01 * flip;
            }
        }
        // cap the max speed forwards
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        // cap the max speed backward as half the max speed forward (slower in reverse)
        if (this.speed<-this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2;
        }
        if (this.speed > 0) {
            this.speed -= this.friction;
        }
        if (this.speed < 0) {
            this.speed += this.friction;
        }
        // stop tiny movement forward
        if (Math.abs(this.speed)<this.friction) {
            this.speed = 0;
        }

        this.x -= Math.sin(this.angle)*this.speed;
        this.y -= Math.cos(this.angle)*this.speed;
    }

    // draw the car
    draw(context, color, drawSensor=false) {
        if (this.damaged) {
            context.fillStyle = "gray";
        } else {
            context.fillStyle = color;
        }
        context.beginPath();
        context.moveTo(this.carContainer[0].x, this.carContainer[0].y);
        for (let i = 1; i < this.carContainer.length; i++) {
            context.lineTo(this.carContainer[i].x, this.carContainer[i].y);
        }
        context.fill();

        if (this.sensor && drawSensor) {
            this.sensor.draw(context);
        }
    }
}