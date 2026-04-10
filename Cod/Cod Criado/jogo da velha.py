def exibir_tabuleiro(tabuleiro):
    for linha in tabuleiro:
        print(" | ".join(linha))
        print("-" * 9)

def verificar_vencedor(tabuleiro, jogador):
    # Verifica linhas, colunas e diagonais
    for linha in tabuleiro:
        if all(celula == jogador for celula in linha):
            return True
    
    for coluna in range(3):
        if all(tabuleiro[linha][coluna] == jogador for linha in range(3)):
            return True
    
    if all(tabuleiro[i][i] == jogador for i in range(3)) or all(tabuleiro[i][2-i] == jogador for i in range(3)):
        return True
    
    return False

def jogo_da_velha():
    tabuleiro = [[" " for _ in range(3)] for _ in range(3)]
    jogador_atual = "X"

    for _ in range(9):  # Máximo de 9 jogadas
        exibir_tabuleiro(tabuleiro)
        
        try:
            linha, coluna = map(int, input(f"Jogador {jogador_atual}, escolha linha e coluna (0-2 separados por espaço): ").split())
            if tabuleiro[linha][coluna] != " ":
                print("Posição ocupada! Escolha outra.")
                continue
        except (ValueError, IndexError):
            print("Entrada inválida! Digite dois números entre 0 e 2 separados por espaço.")
            continue
        
        tabuleiro[linha][coluna] = jogador_atual
        
        if verificar_vencedor(tabuleiro, jogador_atual):
            exibir_tabuleiro(tabuleiro)
            print(f"Jogador {jogador_atual} venceu!")
            return
        
        jogador_atual = "O" if jogador_atual == "X" else "X"

    exibir_tabuleiro(tabuleiro)
    print("Empate!")

jogo_da_velha()
