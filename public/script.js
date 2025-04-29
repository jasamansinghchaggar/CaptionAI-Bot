// ChatGPT-style UI interactions for CaptionAI Bot
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const responseType = document.getElementById('response-type');
const captionLength = document.getElementById('caption-length');
const sendButton = document.querySelector('.send-button');

// Initialize with welcome message
document.addEventListener('DOMContentLoaded', () => {
    appendMessage('Hello! I can help you create engaging captions. Just describe what you need a caption for.', 'bot');
    
    // Set up textarea auto-resize
    setupTextareaAutoResize();
    
    // Update send button state
    updateSendButtonState();
});

function appendMessage(text, sender = 'user') {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Use marked.js to parse markdown if it's a bot message
    if (sender === 'bot') {
        // Set innerHTML with the parsed markdown
        contentDiv.innerHTML = marked.parse(text);
    } else {
        // For user messages, just use text content for security
        contentDiv.textContent = text;
    }
    
    msgDiv.appendChild(contentDiv);
    chatWindow.appendChild(msgDiv);
    
    // Animate message appearance
    gsap.fromTo(msgDiv, { opacity: 0, y: 10 }, { 
        opacity: 1, 
        y: 0, 
        duration: 0.3, 
        ease: 'power2.out' 
    });
    
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Auto-resize textarea as user types
function setupTextareaAutoResize() {
    userInput.setAttribute('style', 'height: auto;');
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        updateSendButtonState();
    });
}

// Update send button appearance based on input
function updateSendButtonState() {
    if (userInput.value.trim()) {
        sendButton.classList.add('active');
        sendButton.querySelector('i').style.color = '#fff';
    } else {
        sendButton.classList.remove('active');
        sendButton.querySelector('i').style.color = 'var(--color-text-secondary)';
    }
}

// Sanitize user input to prevent XSS
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    
    // Basic input validation
    if (!text) return;
    
    // Reset textarea height
    userInput.style.height = 'auto';
    
    // Sanitize input before displaying
    const sanitizedText = sanitizeInput(text);
    appendMessage(sanitizedText, 'user');
    userInput.value = '';
    updateSendButtonState();
    
    // Show bot thinking animation
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'message-content';
    typingContent.innerHTML = '<div class="thinking"><span></span><span></span><span></span></div>';
    
    typingDiv.appendChild(typingContent);
    chatWindow.appendChild(typingDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    
    // Add loading state to button
    sendButton.disabled = true;
    const originalIcon = sendButton.innerHTML;
    sendButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    // Send request to backend (main.js)
    try {
        const res = await fetch('/api/caption', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: text,
                responseType: responseType.value,
                captionLength: captionLength.value
            })
        });
        
        chatWindow.removeChild(typingDiv);
        
        if (!res.ok) {
            // Handle non-200 responses
            const errorData = await res.json();
            throw new Error(errorData.error || `Server error: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!data.caption) {
            throw new Error('Received empty caption from server');
        }
        
        // The caption now will be rendered with markdown
        appendMessage(data.caption, 'bot');
    } catch (err) {
        console.error('Error getting caption:', err);
        chatWindow.removeChild(typingDiv);
        appendMessage(`Error: ${err.message || 'Could not get a response. Please try again.'}`, 'bot');
    } finally {
        // Reset button state
        sendButton.disabled = false;
        sendButton.innerHTML = originalIcon;
    }
});

// Add accessibility keyboard handlers
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    } else if (e.key === 'Enter' && e.shiftKey) {
        // Allow line breaks with Shift+Enter
    }
});

// Toggle options panel
document.querySelector('.tool-button').addEventListener('click', () => {
    const optionsContainer = document.querySelector('.options-container');
    optionsContainer.classList.toggle('active');
});

// Initialize any header button functionality
document.querySelector('.new-chat-button').addEventListener('click', () => {
    // Clear chat history
    while (chatWindow.firstChild) {
        chatWindow.removeChild(chatWindow.firstChild);
    }
    // Add welcome message again
    appendMessage('Hello! I can help you create engaging captions. Just describe what you need a caption for.', 'bot');
});

// Add styles for thinking animation
const style = document.createElement('style');
style.textContent = `
    .thinking {
        display: flex;
        align-items: center;
        gap: 5px;
        height: 20px;
    }
    
    .thinking span {
        display: block;
        width: 8px;
        height: 8px;
        background-color: #acacbe;
        border-radius: 50%;
        opacity: 0.6;
        animation: thinking 1.4s infinite ease-in-out both;
    }
    
    .thinking span:nth-child(1) {
        animation-delay: -0.32s;
    }
    
    .thinking span:nth-child(2) {
        animation-delay: -0.16s;
    }
    
    @keyframes thinking {
        0%, 80%, 100% { transform: scale(0.6); }
        40% { transform: scale(1); }
    }
`;
document.head.appendChild(style);