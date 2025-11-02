import React from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Renderiza um componente React em um container temporário e inicia a impressão.
 * O CSS de impressão em index.html garante que apenas o conteúdo correto seja visível.
 * @param Component O componente React a ser impresso.
 * @param props As props do componente.
 */
export const printComponent = <P extends object>(
    Component: React.FC<P>, 
    props: P
) => {
    // Encontra o container de impressão global
    const reportContainer = document.getElementById('report-content');
    
    if (reportContainer) {
        // Cria uma 'root' do React para renderizar o componente no container
        const root = createRoot(reportContainer);
        
        // Renderiza o componente no container
        root.render(<Component {...props} />);
        
        // Usa um pequeno timeout para garantir que o componente seja renderizado antes de imprimir
        setTimeout(() => {
            window.print();
            
            // Após a impressão, limpa o container
            // Um segundo timeout garante que a caixa de diálogo de impressão já tenha sido fechada
            setTimeout(() => {
                root.unmount();
                reportContainer.innerHTML = '';
            }, 100);
        }, 100);
    } else {
        console.error("Elemento #report-content não encontrado. Verifique index.html.");
        alert("Erro ao preparar a impressão. Recarregue a página.");
    }
};