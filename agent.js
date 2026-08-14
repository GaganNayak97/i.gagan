/* AI Chatbot Agent - Portfolio Assistant */

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    initChatbot();
  } catch (error) {
    console.error('[chatbot] failed to initialise:', error);
  }
});

function initChatbot() {
  const elements = {
    agentToggle: document.getElementById('agent-toggle'),
    agentPanel: document.getElementById('agent-panel'),
    agentClose: document.getElementById('agent-close'),
    agentForm: document.getElementById('agent-form'),
    agentInput: document.getElementById('agent-input'),
    agentMessages: document.getElementById('agent-messages'),
    agentQuickReplies: document.getElementById('agent-quick-replies'),
    agentWidget: document.getElementById('agent-widget')
  };

  const missing = Object.keys(elements).filter(key => !elements[key]);
  if (missing.length > 0) {
    // Bail out loudly instead of throwing halfway through wiring up listeners
    throw new Error(`missing chatbot elements: ${missing.join(', ')}`);
  }

  const { agentToggle, agentPanel, agentClose, agentForm, agentInput, agentMessages, agentQuickReplies, agentWidget } = elements;

  // Quick reply suggestions
  const quickReplies = [
    "Tell me about your services",
    "Show me your portfolio",
    "How to contact you?",
    "What's your experience?"
  ];

  // Knowledge base for AI responses
  const knowledgeBase = {
    services: {
      keywords: ['service', 'services', 'do', 'offer', 'skills', 'expertise'],
      response: "I specialize in:\n\n1. **Web Design & Systems** - Responsive, SEO-ready websites\n2. **Product Design** - MVP design and GTM strategies\n3. **Visual Design** - Graphics, logos, and brand identity\n4. **Video Editing** - Motion graphics and cinematic content\n5. **Digital Marketing** - SEO, SEM, and social media campaigns\n\nWhat service interests you most?"
    },
    portfolio: {
      keywords: ['portfolio', 'work', 'project', 'projects', 'case study', 'samples'],
      response: "I've worked on amazing projects including:\n\n• **TryHackMe Brand Redesign** - Creative design & web elements\n• **Involve Design System** - Figma variables & product layouts\n• **Simplify-ERP** - SEO and conversion optimization\n• **GGHOST Co-Founder** - Branding & social media visuals\n\nWould you like details on any specific project?"
    },
    contact: {
      keywords: ['contact', 'reach', 'email', 'message', 'call', 'connect', 'how to contact'],
      response: "Here's how to reach me:\n\n📧 **Email:** hello@gagannyc.com\n💬 **Skype/Discord:** gagan.nyc\n📍 **Location:** New York, NY\n\nYou can also fill out the contact form below, or connect via social media. I'll get back to you within 24 hours!"
    },
    experience: {
      keywords: ['experience', 'background', 'career', 'work history', 'years', 'expertise'],
      response: "I have 13 years of creative experience:\n\n**Current Roles:**\n• Creative Designer at TryHackMe LLC (2025-)\n• Founder/Creative Director at DirectlyNik™ (2023-)\n\n**Recent Experience:**\n• Head of Design at Involve (2024-2025)\n• Chief Digital Marketing Executive at Simplify-ERP (2021-2023)\n\nI bridge creativity with strategy to solve business problems through design and digital marketing."
    },
    pricing: {
      keywords: ['price', 'pricing', 'cost', 'rate', 'fee', 'budget', 'how much'],
      response: "Pricing depends on the project scope and complexity:\n\n💼 **Custom Projects** - Starting from $3,000\n🎨 **Design Services** - Hourly or fixed rates\n📱 **Web Development** - Starting from $5,000\n🎬 **Video/Motion** - Custom quotes\n\nLet's discuss your specific needs. I offer flexible engagement models!"
    },
    default: {
      response: "That's a great question! I'm here to help. You can ask me about:\n\n• My services and expertise\n• Portfolio projects and case studies\n• How to contact me\n• My background and experience\n• Pricing and engagement models\n\nWhat would you like to know?"
    }
  };

  // Toggle panel open/close
  function togglePanel() {
    agentPanel.classList.toggle('is-open');
    agentToggle.setAttribute('aria-expanded', agentPanel.classList.contains('is-open'));
    
    if (agentPanel.classList.contains('is-open')) {
      agentInput.focus();
      // Show quick replies if no messages yet
      if (agentMessages.children.length === 0) {
        showQuickReplies();
      }
    }
  }

  // Display quick reply buttons
  function showQuickReplies() {
    agentQuickReplies.innerHTML = '';
    quickReplies.forEach(reply => {
      const btn = document.createElement('button');
      btn.className = 'agent-quick-reply';
      btn.textContent = reply;
      btn.type = 'button';
      btn.addEventListener('click', () => {
        agentInput.value = reply;
        // Cancelable, otherwise preventDefault() is ignored and the form navigates away
        agentForm.dispatchEvent(new Event('submit', { cancelable: true }));
      });
      agentQuickReplies.appendChild(btn);
    });
  }

  // Add message to chat
  function addMessage(text, sender = 'assistant') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `agent-bubble ${sender}`;
    messageDiv.textContent = text;
    
    // Support markdown-like formatting
    if (sender === 'assistant') {
      messageDiv.innerHTML = formatMessageText(text);
    }
    
    agentMessages.appendChild(messageDiv);
    agentMessages.scrollTop = agentMessages.scrollHeight;
  }

  // Format message text with markdown-like styling
  function formatMessageText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  // Get AI response based on user input
  function getAIResponse(userMessage) {
    const messageLower = userMessage.toLowerCase();
    
    // Find matching knowledge base entry
    for (const [key, data] of Object.entries(knowledgeBase)) {
      if (key !== 'default' && data.keywords && data.keywords.some(keyword => messageLower.includes(keyword))) {
        return data.response;
      }
    }
    
    // Default response if no match found
    return knowledgeBase.default.response;
  }

  // Handle form submission
  agentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = agentInput.value.trim();
    
    if (message) {
      // Clear quick replies when first message is sent
      if (agentMessages.children.length === 0) {
        agentQuickReplies.innerHTML = '';
      }
      
      // Add user message
      addMessage(message, 'user');
      agentInput.value = '';
      
      // Simulate AI thinking delay
      setTimeout(() => {
        try {
          addMessage(getAIResponse(message), 'assistant');
        } catch (error) {
          console.error('[chatbot] could not generate a reply:', error);
          addMessage("Sorry, something went wrong on my side. Please email hello@gagannyc.com instead.", 'assistant');
        }
      }, 500);
    }
  });

  // Event listeners
  agentToggle.addEventListener('click', togglePanel);
  agentClose.addEventListener('click', togglePanel);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && agentPanel.classList.contains('is-open')) {
      togglePanel();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!agentWidget.contains(e.target) && agentPanel.classList.contains('is-open')) {
      togglePanel();
    }
  });
}
