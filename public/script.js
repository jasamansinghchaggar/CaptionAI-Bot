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
    
    // Create wrapper for content and icon
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-content-wrapper';
    
    // Create icon element
    const iconDiv = document.createElement('div');
    iconDiv.className = 'message-icon';
    
    if (sender === 'bot') {
        iconDiv.innerHTML = '<i class="fas fa-robot"></i>';
    } else {
        iconDiv.innerHTML = '<i class="fas fa-user"></i>';
    }
    
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
    
    // Build the message structure
    contentWrapper.appendChild(iconDiv);
    contentWrapper.appendChild(contentDiv);
    msgDiv.appendChild(contentWrapper);
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
    
    // Create wrapper for content and icon
    const typingWrapper = document.createElement('div');
    typingWrapper.className = 'message-content-wrapper';
    
    // Create bot icon
    const typingIcon = document.createElement('div');
    typingIcon.className = 'message-icon';
    typingIcon.innerHTML = '<i class="fas fa-robot"></i>';
    
    // Create typing animation in content
    const typingContent = document.createElement('div');
    typingContent.className = 'message-content';
    typingContent.innerHTML = '<div class="thinking"><span></span><span></span><span></span></div>';
    
    // Add to DOM
    typingWrapper.appendChild(typingIcon);
    typingWrapper.appendChild(typingContent);
    typingDiv.appendChild(typingWrapper);
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