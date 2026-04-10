def calculadora():
    print("Selecione a operação:")
    print("1 - Soma")
    print("2 - Subtração")
    print("3 - Multiplicação")
    print("4 - Divisão")

    opcao = input("Digite o número da operação desejada: ")

    if opcao in ["1", "2", "3", "4"]:
        num1 = float(input("Digite o primeiro número: "))
        num2 = float(input("Digite o segundo número: "))

        if opcao == "1":
            resultado = num1 + num2
            operador = "+"
        elif opcao == "2":
            resultado = num1 - num2
            operador = "-"
        elif opcao == "3":
            resultado = num1 * num2
            operador = "*"
        elif opcao == "4":
            if num2 == 0:
                print("Erro! Não é possível dividir por zero.")
                return
            resultado = num1 / num2
            operador = "/"

        print(f"Resultado: {num1} {operador} {num2} = {resultado}")

    else:
        print("Opção inválida! Tente novamente.")

calculadora()
