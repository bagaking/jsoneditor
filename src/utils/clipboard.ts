
export async function copyToClipboard(content?: string, cbSuccess?: (c: string) => void): Promise<boolean> {
    if (!content) return false;

    try {
        // 尝试使用 clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(content);
            cbSuccess?.(content);
            return true;
        }
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
    
    // 降级方案：使用 execCommand   
    try {  
        const textArea = document.createElement('textarea');  
        textArea.value = content; 
        textArea.style.position = 'fixed';   
        textArea.style.left = '-999999px'; 
        textArea.style.top = '-999999px';    
        document.body.appendChild(textArea);    
        textArea.focus();   
        textArea.select(); 
        document.execCommand('copy');    
        textArea.remove();  
        cbSuccess?.(content);  
        return true;  
    } catch (err) {   
        console.error('Failed to copy:', err); 
        return false;    
    }
}