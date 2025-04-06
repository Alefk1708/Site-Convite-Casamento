let isOpened = false;
        
        function openEnvelope(element) {
            if(isOpened) return;
            
            element.classList.add('open');
            isOpened = true;
            
            // Remove o cursor pointer após abertura
            element.style.cursor = 'default';
        }

const envelope = document.getElementById("envelope")
const clickAqui = document.getElementById("clickAqui")

envelope.addEventListener("click", () => {
    clickAqui.remove()
})