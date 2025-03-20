document.addEventListener("DOMContentLoaded", function() {
    // Inicializar o editor CodeMirror
    const editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
      lineNumbers: true,
      mode: "javascript",
      theme: "monokai",
      indentUnit: 2,
      smartIndent: true,
      tabSize: 2,
      indentWithTabs: false,
      lineWrapping: false,
      styleActiveLine: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      extraKeys: {
        "Ctrl-Space": "autocomplete",
        "F11": function(cm) {
          cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
        "Esc": function(cm) {
          if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
        }
      }
    });
    
    // Atualizar informações de linha e coluna
    editor.on("cursorActivity", function() {
      const pos = editor.getCursor();
      document.getElementById("lineInfo").textContent = pos.line + 1;
      document.getElementById("colInfo").textContent = pos.ch;
    });
    
    // Funções para os botões da barra de ferramentas
    const buttons = document.querySelectorAll(".toolbar button");
    
    buttons.forEach(button => {
      button.addEventListener("click", function() {
        const action = this.getAttribute("title");
        
        switch(action) {
          case "Desfazer":
            editor.undo();
            break;
          case "Refazer":
            editor.redo();
            break;
          case "Aumentar zoom":
            changeFontSize(1);
            break;
          case "Diminuir zoom":
            changeFontSize(-1);
            break;
          case "Alternar quebra de linha":
            editor.setOption("lineWrapping", !editor.getOption("lineWrapping"));
            break;
          case "Alternar numeração":
            editor.setOption("lineNumbers", !editor.getOption("lineNumbers"));
            break;
          case "Adicionar comentário":
            toggleComment();
            break;
          case "Formatar código":
            formatCode();
            break;
          case "Executar":
            executeCode();
            break;
          case "Verificar sintaxe":
            checkSyntax();
            break;
          // Implementar outras funcionalidades conforme necessário
        }
      });
    });
    
    // Alternar entre as abas
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", function() {
        tabs.forEach(t => t.classList.remove("active"));
        this.classList.add("active");
        
        // Aqui poderia implementar a lógica para mostrar o conteúdo correspondente
      });
    });
    
    // Função para alterar o tamanho da fonte
    function changeFontSize(delta) {
      const editorElement = editor.getWrapperElement();
      const currentSize = parseInt(window.getComputedStyle(editorElement).fontSize);
      const newSize = currentSize + delta;
      editorElement.style.fontSize = newSize + "px";
    }
    
    // Função para alternar comentários
    function toggleComment() {
      const selection = editor.getSelection();
      if (selection) {
        // Verificar se a seleção já está comentada
        const isCommented = selection.trim().startsWith("//");
        
        if (isCommented) {
          // Remover comentários
          const uncommented = selection.replace(/^\/\/ ?/gm, "");
          editor.replaceSelection(uncommented);
        } else {
          // Adicionar comentários
          const commented = selection.split("\n").map(line => "// " + line).join("\n");
          editor.replaceSelection(commented);
        }
      } else {
        // Comentar linha atual
        const line = editor.getCursor().line;
        const lineContent = editor.getLine(line);
        const isLineCommented = lineContent.trim().startsWith("//");
        
        if (isLineCommented) {
          editor.replaceRange(lineContent.replace(/^\/\/ ?/, ""), 
            {line: line, ch: 0}, 
            {line: line, ch: lineContent.length});
        } else {
          editor.replaceRange("// " + lineContent, 
            {line: line, ch: 0}, 
            {line: line, ch: lineContent.length});
        }
      }
    }
    
    // Função simples para formatar código (básica)
    function formatCode() {
      try {
        // Esta é uma implementação básica de formatação
        // Para uma solução mais robusta, considere usar bibliotecas como js-beautify
        const code = editor.getValue();
        const formatted = JSON.stringify(JSON.parse(code), null, 2);
        editor.setValue(formatted);
        addToConsole("Código formatado com sucesso");
      } catch (e) {
        addToConsole("Erro ao formatar: " + e.message, "error");
      }
    }
    
    // Função para executar o código
    function executeCode() {
      try {
        const code = editor.getValue();
        // Redirecionar console.log para o painel de console
        const originalLog = console.log;
        console.log = function() {
          addToConsole(Array.from(arguments).join(" "));
          originalLog.apply(console, arguments);
        };
        
        // Criar uma função a partir do código e executá-la
        const fn = new Function(code);
        const result = fn();
        
        // Restaurar console.log
        console.log = originalLog;
        
        if (result !== undefined) {
          addToConsole("Resultado: " + result);
        }
      } catch (e) {
        addToConsole("Erro de execução: " + e.message, "error");
      }
    }
    
    // Função para verificar sintaxe
    function checkSyntax() {
      try {
        const code = editor.getValue();
        // Tenta analisar o código sem executá-lo
        new Function(code);
        addToConsole("Sintaxe válida ✓");
      } catch (e) {
        addToConsole("Erro de sintaxe: " + e.message, "error");
        
        // Tentar encontrar a linha do erro
        const match = e.stack.match(/\<anonymous\>:(\d+)/);
        if (match && match[1]) {
          const lineNum = parseInt(match[1]) - 1;
          editor.setCursor({ line: lineNum, ch: 0 });
          editor.focus();
        }
      }
    }
    
    // Função para adicionar mensagens ao console
    function addToConsole(message, type = "info") {
      const consolePanel = document.querySelector(".console-panel");
      const messageElement = document.createElement("div");
      messageElement.classList.add("console-message", type);
      messageElement.textContent = message;
      consolePanel.appendChild(messageElement);
      consolePanel.scrollTop = consolePanel.scrollHeight;
    }
    
    // Limpar console quando o botão for clicado
    document.querySelector(".tab-actions button:first-child").addEventListener("click", function() {
      document.querySelector(".console-panel").innerHTML = "";
    });
    
    // Inicializar com um exemplo de código simples
    editor.setValue(`// Bem-vindo ao Editor de Scripts
  // Digite seu código JavaScript aqui
  
  function exemplo() {
    const mensagem = "Olá, mundo!";
    console.log(mensagem);
    return mensagem;
  }
  
  exemplo();
  `);
  });