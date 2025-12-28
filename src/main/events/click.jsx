const IDS = ["Draw", "Erase", "Text", "Select"];


export default function buttonListeners() {
    for(let id of IDS) {
        const button = document.getElementById(id);
        button.addEventListener(`click`, () => {
            handleClick(id)
        }, [])
    }
}

function handleClick(id) {
    switch(id) {
        case "Draw": {

            break;
        }

        case "Erase": {
            break;
        }

        default:
            console.error(`No button matching ID ${id} found`);
    }
}