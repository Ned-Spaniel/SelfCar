
class NeuralNetwork {
    constructor(neuronCount) { // neuronCount as an array of neurons in each layer
        this.levels = []; // array for each level/layer of network
        // for each level
        for (let i = 0; i < neuronCount.length - 1; i++) {
            this.levels.push(new Level(
                neuronCount[i], neuronCount[i + 1]
            ));
        }
    }

    static feedForward(givenInputs, network) {
        // feed input values into the first level
        let outputs = Level.feedForward(
            givenInputs, network.levels[0]);

        // take the outputs of previous level and feed them as inputs to the next layer for all remaining layers
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(
                outputs, network.levels[i]);
        }
        // return outputs of output layer/last layer in for loop 
        return outputs;
    }

    static mutate(network, amount=1) {
        network.levels.forEach(level => {
            for(let i =0; i < level.biases.length; i++) {
                level.biases[i] = lerp(
                    level.biases[i],
                    Math.random()*2 - 1,
                    amount
                )
            }
            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {
                    level.weights[i][j],
                    Math.random()*2 - 1,
                    amount
                }
            }
        });
    }
}

class Level {
    constructor(inputCount, outputCount) {
        // new arrays with empty/undefined slots corresponding to the size of the parameter passed
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);

        this.weights = [];
        // loop through all inputs and prepare an emtpy array the size of the output count
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }

        Level.#randomize(this);
    }

    static #randomize(level) {
        // go through a level's inputs
        for (let i = 0; i < level.inputs.length; i++) {
            // for that input, go through each output
            for (let j = 0; j < level.outputs.length; j++) {
                // for every output of that input, set weight to a random value between -1 and 1
                level.weights[i][j] // find index of corresponding i'th input neuron and the j'th output neuron it's iterating over within that input neuron
                = 
                Math.random()*2 - 1; // Math.random() generates num between 0 and 1. multiplying by 2 stretches to 0 -> 2 and subtracting one shifts to -1 -> 1
            }
        }

        // put the biases in the same -1 -> 1 range
        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    static feedForward(givenInputs, level) {
        // go through all level inputs and set them to givenInputs
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i]
        }

        // loop through every output and calculate the sum of the product of the inputs and weights
        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j]*level.weights[j][i]; // product between j'th input and the weight of the j'th input and the i'th output
            }

            if (sum > level.biases[i]) {
                level.outputs[i] = 1;
            } else {
                level.outputs[i] = 0;
            }
        }
        return level.outputs;
    }
}