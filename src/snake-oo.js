function sleep(ms) {
    const end = Date.now() + ms;
    while (Date.now() < end);
}

function arraysIguais(array, otherArray) {
    if(array.length !== otherArray.length) return false;

    for(let indice = 0; indice < array.length; indice++){
        if(array[indice] !== otherArray[indice]) return false;
    }

    return true;
}

function numeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Snake {

    constructor() {
        this.indiceCabeca = 0; 
        this.indiceCauda = 0;
        this.corpo = [[17, 44]]; // (x, y)
        this.tamanho = 1;
        this.direcao = 'DIREITA';
        
        this.DIREITA = 1;
        this.ESQUERDA = -1;
        this.CIMA = 1;
        this.BAIXO = -1;
    }

    /**
     * 
     * @param {*} sentido Indica o sentido o qual a cobra irá se mover, -1 para esquerda, e 1 para a direita  
     */
    andarEixoX(sentido) { 
        let novaCabeca = this.corpo[this.indiceCabeca].slice();
        novaCabeca[1] += sentido;

        this.corpo.push(novaCabeca);
        this.indiceCabeca++;
        this.indiceCauda++; 
    }

    andarEixoY(sentido) {
        let novaCabeca = this.corpo[this.indiceCabeca].slice();
        novaCabeca[0] += sentido;
        
        this.corpo.push(novaCabeca);
        this.indiceCabeca++;
        this.indiceCauda++;
    }

    moveSnake(){
        if(this.direcao === "DIREITA"){
            this.andarEixoX(this.DIREITA);
        } else if (this.direcao === "ESQUERDA") {
            this.andarEixoX(this.ESQUERDA);
        } else if (this.direcao === "CIMA") {
            this.andarEixoY(this.CIMA);
        } else {
            this.andarEixoY(this.BAIXO);
        }
    }

    alteraDirecao(direcao){
        this.direcao = direcao;
    }

    crescer() {
        this.indiceCauda--;
        this.tamanho ++;
    }

    getPosicoesCorpo(){
        return this.corpo.slice(this.indiceCauda, this.indiceCabeca + 1);
    }

    getPosicaoCabeca() {
        return this.corpo[this.indiceCabeca];
    }

    getPosicaoCauda() {
        return this.corpo[this.indiceCauda];
    }

    getPosicaoParte(parte) {
        return this.corpo[parte];
    }
}

/**
 * Processamento do jogo. Gera as informação de saída do jogo. 
 */
class Game {

    constructor(){
        this.tela = new Tela();
        this.snake = new Snake();
        
        this.DIREITA = 1;
        this.ESQUERDA = -1;
        this.CIMA = 1;
        this.BAIXO = -1;
        
        this.ALTURA_TELA = 20;
        this.LARGURA_TELA = 35;

        this.LIMITE_TELA_EIXO_Y = 34;
        this.LIMITE_TELA_EIXO_X = 19;
        
        this.comando = 'd';
        this.posicaoFruta = [0, 0];
        this.temFruta = false;
    }

    iniciar() {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");

        process.stdin.on("data", (tecla) => {
            if (tecla === "\u0003" || tecla === "q") {
                process.exit();
                return;
            }
            this.comando = tecla;  
        });

        this.tela.criaTela(this.LARGURA_TELA, this.ALTURA_TELA);
        this.geraFruta();
        this.gameLoop();
    }

    atualizaDirecao() {
        switch (this.comando) {
            case "w":
                this.snake.alteraDirecao("CIMA");
                break;
            case "a":
                this.snake.alteraDirecao("ESQUERDA");
                break;
            case "s":
                this.snake.alteraDirecao("BAIXO");
                break;
            case "d":
                this.snake.alteraDirecao("DIREITA");
                break;
            case "c":
                this.snake.crescer();
        }
    }

    gameLoop(){
        if (this.comando){
            this.atualizaDirecao();
            this.comando = '';
        }

        console.clear();
        console.log(this.posicaoFruta);
        this.tela.resetTela();
        this.adicionaFruta();
        this.snake.moveSnake();
        this.comeFruta();
        this.desenhaCobra();
        this.tela.renderizaTela();

        if(this.asseguraColisao()){
            console.log("GAME OVER!");
            return;
        }

        setTimeout(() => this.gameLoop(), 200);   
    }

    comeFruta(){
        let posicaoCabeca = this.snake.getPosicaoCabeca();
         
        if(posicaoCabeca[0] === this.posicaoFruta[0] && 
            posicaoCabeca[1] === this.posicaoFruta[1]) {
                this.tela.adicionaElemento(' ', this.posicaoFruta);
                this.snake.crescer();
                this.temFruta = false;
                this.geraFruta();
        }

    }

    adicionaFruta(){
        this.tela.adicionaElemento('✹', this.posicaoFruta);
    }

    desenhaCobra(){
        let arrayPosicoesCobra = this.snake.getPosicoesCorpo();
        arrayPosicoesCobra.forEach(parte => {
            this.tela.adicionaElemento('█', this.asseguraLimiteCampo(parte))});
    }
    
    asseguraLimiteCampo(posicaoCobra){
        posicaoCobra[0] = ((posicaoCobra[0] % this.LIMITE_TELA_EIXO_X) + this.LIMITE_TELA_EIXO_X) % this.LIMITE_TELA_EIXO_X;
        posicaoCobra[1] = ((posicaoCobra[1] % this.LIMITE_TELA_EIXO_Y) + this.LIMITE_TELA_EIXO_Y) % this.LIMITE_TELA_EIXO_Y;
        //if (posicaoCobra[0] === 0) posicaoCobra[0] += (this.LIMITE_TELA_EIXO_X);
        //if (posicaoCobra[1] === 0) posicaoCobra[1] += (this.LIMITE_TELA_EIXO_Y);
        return posicaoCobra;
    }
    
    asseguraColisao() {
        let corpoCobra = this.snake.getPosicoesCorpo();
        for(let i = 0; i < corpoCobra.length; i++){
            for(let j = i + 1; j < corpoCobra.length; j++){
                if(corpoCobra[i][0] === corpoCobra[j][0] && 
                    corpoCobra[i][1] === corpoCobra[j][1]) return true;
            }
        }

        return false;
    }

    geraFruta() {
        let posicaoFruta = [0, 0];
        posicaoFruta[0] = numeroAleatorio(1, this.LIMITE_TELA_EIXO_X - 1); 
        posicaoFruta[1] = numeroAleatorio(1, this.LIMITE_TELA_EIXO_Y - 1); 

        this.posicaoFruta = posicaoFruta;
        this.temFruta = true; 
    }
}

class Tela {
    constructor() {
        this.altura = 0;
        this.largura = 0;
        this.grid = []; // (linha, coluna)
    }

    criaTela(largura, altura) {
        this.altura = altura;
        this.largura = largura;
        this.grid = Array.from({ length: altura}, () => Array(largura).fill("⋅"));

        this.grid.forEach(linha => {linha[0] = "❚"});
        this.grid.forEach(linha => {linha[this.largura - 1] = "❚"});

        this.grid[0] = this.grid[0].map(elemento => "▬");
        this.grid[this.altura - 1] = this.grid[this.altura - 1].map(elemento => "▬"); 
    }

    resetTela(){
        this.grid = Array.from({ length: this.altura}, () => Array(this.largura).fill("⋅"));
        this.grid.forEach(linha => {linha[0] = "❚"});
        this.grid.forEach(linha => {linha[this.largura - 1] = "❚"});

        this.grid[0] = this.grid[0].map(elemento => "▬");
        this.grid[this.altura - 1] = this.grid[this.altura - 1].map(elemento => "▬"); 
    }

    renderizaTela(){
        let arrayLinhas = this.grid.map(linha => linha.join(""));
        arrayLinhas.reverse();
        console.log(arrayLinhas.join("\n"));
    }

    adicionaElemento(elemento, posicao) {
        this.grid[posicao[0]][posicao[1]] = elemento; // [linha][coluna]
    }

}

(function main() {
    const jogo = new Game();
    jogo.iniciar();
})();