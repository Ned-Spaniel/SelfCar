class Sensor{
    constructor(car) {
        this.car = car;
        this.rayCount = 30;
        this.rayLength = 200;
        this.raySpread = Math.PI / 2;

        this.rays = [];
        // read if there is a border from the sensors
        this.readings = [];
    }

    update(roadBorders, traffic) {
        this.#castRays();
        this.readings = [];
        // iterate through all rays and add a reading if there is one
        for (let i = 0; i < this.rays.length; i++) {
            this.readings.push (
                this.#getReadings(
                    this.rays[i], 
                    roadBorders,
                    traffic
                )
            );
        }
    }

    #getReadings(ray, roadBorders, traffic) {
        let touches = [];

        for (let i = 0; i < roadBorders.length; i++) {
            const touch = getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]
            );
            if (touch) {
                touches.push(touch);
            }
        }

        for (let i = 0; i < traffic.length; i++) {
            const trafficContainer = traffic[i].carContainer
            for (let j = 0; j < trafficContainer.length; j++) {
                const value = getIntersection(
                    ray[0],
                    ray[1],
                    trafficContainer[j],
                    trafficContainer[(j + 1) % trafficContainer.length]
                );
                if (value) {
                    touches.push(value);
                }
            }
        }

        // if no touches read, return null
        if (touches.length == 0) {
            return null;
        }
        // 
        else {
            const offsets = touches.map(e => e.offset); // goes through all elements and takes each element offset
            const minOffset = Math.min(...offsets) // Math.min doesn't accept array, so spread the array into many individual values with ...
            return touches.find(e => e.offset == minOffset); // map through and return the touch with the minOffset
        }
    }

    #castRays() {
        this.rays = [];
        for(let i = 0; i < this.rayCount; i++) {
            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                i / (this.rayCount - 1)
            ) + this.car.angle;

            const start = {x: this.car.x, y: this.car.y};
            const end = {
                x: this.car.x - Math.sin(rayAngle)*this.rayLength,
                y: this.car.y - Math.cos(rayAngle)*this.rayLength
            };
            this.rays.push([start, end]);
        }
    }

    draw(context) {
        for (let i = 0; i < this.rayCount; i++) {
            let end = this.rays[i][1];
            // if there is a reading, set the end to the value of that reading
            if (this.readings[i]) {
                end = this.readings[i];
            }
            context.beginPath();
            context.lineWidth = 2;
            context.strokeStyle = "yellow";
            context.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            context.lineTo(
                end.x,
                end.y
            );
            context.stroke();

            context.beginPath();
            context.lineWidth = 2;
            context.strokeStyle = "black";
            context.moveTo(
                this.rays[i][1].x, // t[p of where end of ray could be
                this.rays[i][1].y // end point
            );
            context.lineTo(
                end.x,
                end.y
            );
            context.stroke();
        }
    }
}