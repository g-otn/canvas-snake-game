var dimensoesJogo = {
    largura: 20,
    altura: 15,
    tamanhoPosicao: 40
}
var canvas = {
    elemento: document.getElementById('jogoCanvas')
}

var cobra = []
var tamanhoInicialDaCobra = 4
var velocidade = 5
var imortal = false // Impede detecção de colisões se true

var comida = {}
var ultimaTeclaPressionada
var loop // Guarda o setTimeout, para se reiniciar, ter como cancelar


function reiniciarJogo() {
    // Inicia o canvas
    canvas.elemento.height = dimensoesJogo.altura * dimensoesJogo.tamanhoPosicao
    canvas.elemento.width = dimensoesJogo.largura * dimensoesJogo.tamanhoPosicao
    canvas.elemento.style.height = `${dimensoesJogo.altura * dimensoesJogo.tamanhoPosicao}px`
    canvas.elemento.style.width = `${dimensoesJogo.largura * dimensoesJogo.tamanhoPosicao}px`
    canvas.contexto = canvas.elemento.getContext('2d')

    // Reinicia variáveis
    cobra = []
    clearInterval(loop)
    ultimaTeclaPressionada = null
    canvas.contexto.shadowColor = 'lime'
    canvas.contexto.shadowBlur = '0'
    canvas.elemento.style.boxShadow = '0 0 15px #fff'
    document.getElementById('pontos').innerHTML = 0
    document.getElementById('tamanhoInicial').setAttribute('max', dimensoesJogo.largura * dimensoesJogo.altura - 1)

    // Cria a primeira parte da cobra ("cabeça da cobra")
    let cabecaDaCobra = {
        x: Math.floor(Math.random() * dimensoesJogo.largura),
        y: Math.floor(Math.random() * dimensoesJogo.altura)
    }
    cobra.push(cabecaDaCobra)

    // Gera a primeira comida
    gerarNovaComida()

    // Começa o loop do jogo
    atualizar()
}

window.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 'ArrowDown':
            if (cobra.length > 1 && cobra[0].y == cobra[1].y - 1) // Não deixa entrar dentro de si mesma (ao tentar ir para baixo)
                break
            ultimaTeclaPressionada = event.key
            break
        case 'ArrowUp':
            if (cobra.length > 1 && cobra[0].y == cobra[1].y + 1) // Não deixa entrar dentro de si mesma (ao tentar ir para cima)
                break
            ultimaTeclaPressionada = event.key
            break
        case 'ArrowLeft':
            if (cobra.length > 1 && cobra[0].x == cobra[1].x + 1) // Não deixa entrar dentro de si mesma (ao tentar ir para esquerda)
                break
            ultimaTeclaPressionada = event.key
            break
        case 'ArrowRight':
            if (cobra.length > 1 && cobra[0].x == cobra[1].x - 1) // Não deixa entrar dentro de si mesma (ao tentar ir para direita)
                break
            ultimaTeclaPressionada = event.key
            break
        case ' ':
            reiniciarJogo()
    }
})

function atualizarCoordenadasDaCobra() {
    // Exemplo: Ir para a esquerda
    // 1º:      [0][1][2][3][4] // Posição da cabeça (cobra[0]) é guardada (1.1º) e atualizada (1.2º)
    // 2º:   [0][1][2][3][4][5] // As novas coordenadas são inseridas no começo da array da cobra
    // 3º:   [0][1][2][3][4]    // O último elemento da array da cobra é removida

    // 1.1º: Guarda a posição da cabeça da cobra (cobra[0]), que será atualizada
    let novaPosicaoDaCabecaDaCobra = {
        x: cobra[0].x,
        y: cobra[0].y
    }

    // 1.2º: Atualiza as coordenadas da cabeça da cobra
    switch (ultimaTeclaPressionada) {
        case 'ArrowDown':
            novaPosicaoDaCabecaDaCobra.y++
            break
        case 'ArrowUp':
            novaPosicaoDaCabecaDaCobra.y--
            break
        case 'ArrowLeft':
            novaPosicaoDaCabecaDaCobra.x--
            break
        case 'ArrowRight':
            novaPosicaoDaCabecaDaCobra.x++
            break
        default:
            return;
    }

    // 2º: Insere as novas coordenadas da cabeça da cobra na frente do começo da cobra
    cobra.unshift(novaPosicaoDaCabecaDaCobra)

    // 3º: Remove a ponta da cobra
    cobra.pop()
}

function cabecaDaCobraColidiu() {
    // Impede de colidir com a própria cauda antes de começar a andar,
    // pois no começo do jogo a cauda está na mesma posição da cabeça
    if (imortal || ultimaTeclaPressionada == null)
        return false

    // Colisão com a borda
    if (cobra[0].x < 0 || cobra[0].x >= dimensoesJogo.largura || cobra[0].y < 0 || cobra[0].y >= dimensoesJogo.altura) {
        console.log(`Bateu na borda! Cabeca da cobra: (x${cobra[0].x}, y${cobra[0].y})`)
        return true
    }

    // Não é possível a cobra bater nela mesma com o tamanho <= 4
    if (cobra.length < 5)
        return false // pula verificações

    // Colisão com o corpo da cobra
    for (let i = 1; i < cobra.length; i++)
        if (cobra[0].x == cobra[i].x && cobra[0].y == cobra[i].y) {
            console.log(`Bateu no corpo! Cabeca da cobra: (x${cobra[0].x}, y${cobra[0].y})`)
            return true
        }

    return false
}

function gerarNovaComida() {
    let novaComida = {}
    do {
        novaComida = {
            x: Math.floor(Math.random() * dimensoesJogo.largura),
            y: Math.floor(Math.random() * dimensoesJogo.altura),
        }
    } while (
        // Impede de gerar a comida dentro da cobra
        cobra.some(pedacoDaCobra => (pedacoDaCobra.x == novaComida.x && pedacoDaCobra.y == novaComida.y))
    )
    comida.x = novaComida.x
    comida.y = novaComida.y

    console.log(`Nova comida em (x${comida.x}, y${comida.y})`)
}

function aumentarCaudaDaCobra() {
    // Faz com que a ponta da cauda fique na sua última posição ("parada") por mais um loop,
    // após a cabeça andar, estendendo a cauda da cobra
    cobra.push({
        x: cobra[cobra.length - 1].x,
        y: cobra[cobra.length - 1].y
    })
}

function verificarSeComeu() {
    if (cobra[0].x == comida.x && cobra[0].y == comida.y) {
        aumentarCaudaDaCobra()

        // Atualiza placar e recorde
        let pontos = document.getElementById('pontos')
        pontos.innerHTML = (Number(pontos.innerHTML) + velocidade*velocidade)
        let recorde = document.getElementById('recorde')
        if (Number(pontos.innerHTML) > Number(recorde.innerHTML))
            recorde.innerHTML = pontos.innerHTML

        // Cria nova comida se houver espaço
        if (cobra.length < dimensoesJogo.largura * dimensoesJogo.altura)
            gerarNovaComida()
    }
}

function desenharNoCanvas() {
    // Limpa o canvas
    canvas.contexto.fillStyle = 'black'
    canvas.contexto.fillRect(0, 0, canvas.elemento.width, canvas.elemento.height)

    // Desenha a cobra
    for (let i = cobra.length - 1; i > -1; i--) {
        canvas.contexto.fillStyle = `rgb(0,${100 + 155 * (i % 3)},0)` // 155 * (i % n) -> a cada n pedaços o 100 (verde escuro) é somado 155 = 255 (verde claro)
        canvas.contexto.fillRect(cobra[i].x * dimensoesJogo.tamanhoPosicao, cobra[i].y * dimensoesJogo.tamanhoPosicao, dimensoesJogo.tamanhoPosicao, dimensoesJogo.tamanhoPosicao)
    }

    // Desenha a comida
    canvas.contexto.shadowBlur = dimensoesJogo.tamanhoPosicao.toString()
    canvas.contexto.fillStyle = 'red'
    canvas.contexto.fillRect(comida.x * dimensoesJogo.tamanhoPosicao, comida.y * dimensoesJogo.tamanhoPosicao, dimensoesJogo.tamanhoPosicao, dimensoesJogo.tamanhoPosicao)

    canvas.contexto.shadowBlur = '0' // Desativa o brilho para quando a cobra for desenhada novamente
}

function terminarJogo(ganhou) {
    console.log(`Jogo terminado! Ganhou: ${ganhou} Tamanho da cobra: ${cobra.length}`)
    if (ganhou) {
        canvas.elemento.style.boxShadow = '0 0 15px gold'
        // Desenha a cobra em dourado
        for (let i = cobra.length - 1; i > -1; i--) {
            canvas.contexto.fillStyle = `rgb(${218 + 37 * (i % 3)},${165 + 50 * (i % 3)},${32 * (i % 3)})` // Dourado e dourado escuro
            canvas.contexto.fillRect(cobra[i].x * dimensoesJogo.tamanhoPosicao, cobra[i].y * dimensoesJogo.tamanhoPosicao, dimensoesJogo.tamanhoPosicao, dimensoesJogo.tamanhoPosicao)
        }
    } else {
        // Desenhar a marca de colisão
        canvas.contexto.shadowColor = 'red'
        canvas.contexto.shadowBlur = dimensoesJogo.tamanhoPosicao.toString()
        canvas.contexto.fillStyle = `rgb(0,100,0)`
        for (let i = 0; i < 2; i++)
            canvas.contexto.fillRect(cobra[0].x * dimensoesJogo.tamanhoPosicao, cobra[0].y * dimensoesJogo.tamanhoPosicao, dimensoesJogo.tamanhoPosicao, dimensoesJogo.tamanhoPosicao)
    }
}

function atualizar() {
    // Cria a cauda inicial
    if (cobra.length < tamanhoInicialDaCobra)
        aumentarCaudaDaCobra()

    // Verificações do jogo
    atualizarCoordenadasDaCobra()
    desenharNoCanvas()
    if (cobra.length >= dimensoesJogo.largura * dimensoesJogo.altura)
        terminarJogo(true)
    else if (!cabecaDaCobraColidiu()) {
        verificarSeComeu()
        loop = setTimeout(atualizar, 1000 / (velocidade * 2))
    } else
        terminarJogo(false)
}

reiniciarJogo()