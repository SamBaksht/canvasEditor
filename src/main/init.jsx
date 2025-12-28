import handleMouseMove from "./events/mouse";
import buttonListeners from "./events/click";

export default function createListeners(grid) {
    handleMouseMove(grid);
    buttonListeners()
}

