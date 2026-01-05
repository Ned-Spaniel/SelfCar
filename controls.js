class Controls {
    constructor(type) {
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;

        switch(type) {
            case "KEYS":
                this.#addKeyboardListeners();
                break;
            case "DUMMY":
                this.forward = true;
                break;
        }
    }

    // set the corresponding key to true when it's pressed
    #addKeyboardListeners() { // private function
        document.onkeydown = (event) => {
            switch (event.key) {
                case "w":
                    this.forward = true;
                    break;
                case "s":
                    this.backward = true;
                    break;
                case "a":
                    this.left = true;
                    break;
                case "d":
                    this.right = true;
                    break;
            }
        }
        
        // reset the key to false when it's released
        document.onkeyup = (event) => {
            switch (event.key) {
                case "w":
                    this.forward = false;
                    break;
                case "s":
                    this.backward = false;
                    break;
                case "a":
                    this.left = false;
                    break;
                case "d":
                    this.right = false;
                    break;
            }
        }
    }
}