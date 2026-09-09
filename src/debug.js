window.onerror = function (message, source, lineno, colno, error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '0';
    errorDiv.style.left = '0';
    errorDiv.style.width = '100%';
    errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '20px';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.fontFamily = 'monospace';
    errorDiv.style.whiteSpace = 'pre-wrap';
    errorDiv.innerText = `Error: ${message}\nSource: ${source}:${lineno}:${colno}\nStack: ${error ? error.stack : 'No stack trace'}`;
    document.body.appendChild(errorDiv);
    return false;
};

window.addEventListener('unhandledrejection', function (event) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '50%';
    errorDiv.style.left = '0';
    errorDiv.style.width = '100%';
    errorDiv.style.backgroundColor = 'rgba(255, 165, 0, 0.8)';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '20px';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.fontFamily = 'monospace';
    errorDiv.style.whiteSpace = 'pre-wrap';
    errorDiv.innerText = `Unhandled Rejection: ${event.reason}`;
    document.body.appendChild(errorDiv);
});
