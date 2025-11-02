import React from 'react';
import ReactDOMServer from 'react-dom/server';

/**
 * Renderiza um componente React em uma string HTML e inicia a impressão.
 * O CSS de impressão em index.html garante que apenas o conteúdo dentro de #report-content seja visível.
 * @param Component O componente React a ser impresso.
 * @param props As props do componente.
 */
export const printComponent = <P extends object>(
    Component: React.FC<P>, 
    props: P
) => {
    // 1. Renderiza o componente para HTML
    const htmlContent = ReactDOMServer.renderToString(<Component {...props} />);

    // 2. Encontra o container de impressão global
    const reportContainer = document.getElementById('report-content');
    
    if (reportContainer) {
        // 3. Insere o conteúdo HTML no container
        reportContainer.innerHTML = htmlContent;
        
        // 4. Chama a impressão nativa
        window.print();
        
        // 5. Limpa o container após um pequeno atraso (para garantir que a impressão seja iniciada)
        setTimeout(() => {
            reportContainer.innerHTML = '';
        }, 100);
    } else {
        console.error("Elemento #report-content não encontrado. Verifique index.html.");
        alert("Erro ao preparar a impressão. Recarregue a página.");
    }
};