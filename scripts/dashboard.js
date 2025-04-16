// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    // Set welcome message
    const username = localStorage.getItem('username') || 'User';
    document.getElementById('welcomeMessage').textContent = `Welcome, ${username}`;

    // Initialize tickets from local storage
    loadTickets();

    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('createTicketBtn').addEventListener('click', openCreateTicketModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeCreateTicketModal);
    document.getElementById('createTicketForm').addEventListener('submit', handleCreateTicket);

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('createTicketModal');
        if (event.target === modal) {
            closeCreateTicketModal();
        }
    });
});

// Load tickets from local storage
function loadTickets() {
    const tickets = getTicketsFromStorage();
    
    // Clear all columns
    const columns = document.querySelectorAll('.column-content');
    columns.forEach(column => {
        column.innerHTML = '';
    });

    // Add tickets to their respective columns
    tickets.forEach(ticket => {
        addTicketToColumn(ticket);
    });

    // Update ticket counts
    updateTicketCounts();
}

// Get tickets from local storage
function getTicketsFromStorage() {
    const tickets = localStorage.getItem('tickets');
    return tickets ? JSON.parse(tickets) : [];
}

// Save tickets to local storage
function saveTicketsToStorage(tickets) {
    localStorage.setItem('tickets', JSON.stringify(tickets));
}

// Add a ticket to its column
function addTicketToColumn(ticket) {
    const columnId = ticket.position.replace(' ', '');
    const column = document.querySelector(`#${columnId} .column-content`);
    
    if (!column) return;

    const ticketElement = createTicketElement(ticket);
    column.appendChild(ticketElement);
}

// Create a ticket DOM element
function createTicketElement(ticket) {
    const ticketElement = document.createElement('div');
    ticketElement.className = 'ticket-card';
    ticketElement.id = ticket.id;
    ticketElement.draggable = true;
    
    // Add position class for styling
    const positionClass = `position-${ticket.position.replace(' ', '-')}`;
    
    ticketElement.innerHTML = `
        <h3 class="ticket-title">${ticket.title}</h3>
        <p class="ticket-customer">Customer: ${ticket.customerName}</p>
        <span class="ticket-position ${positionClass}">${ticket.position}</span>
        <p class="ticket-id">ID: ${ticket.id.substring(0, 8)}</p>
    `;
    
    // Add drag event listeners
    ticketElement.addEventListener('dragstart', handleDragStart);
    ticketElement.addEventListener('dragend', handleDragEnd);
    
    return ticketElement;
}

// Update ticket counts in each column
function updateTicketCounts() {
    const positions = ['Assigned', 'InProcess', 'Resolved', 'Deployed', 'Closed'];
    
    positions.forEach(position => {
        const columnContent = document.querySelector(`#${position} .column-content`);
        const countElement = document.getElementById(`${position}Count`);
        
        if (columnContent && countElement) {
            const ticketCount = columnContent.querySelectorAll('.ticket-card').length;
            countElement.textContent = ticketCount;
        }
    });
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

// Open create ticket modal
function openCreateTicketModal() {
    const modal = document.getElementById('createTicketModal');
    modal.classList.add('show');
    
    // Reset form
    document.getElementById('createTicketForm').reset();
    document.getElementById('customerNameError').textContent = '';
    document.getElementById('ticketTitleError').textContent = '';
}

// Close create ticket modal
function closeCreateTicketModal() {
    const modal = document.getElementById('createTicketModal');
    modal.classList.remove('show');
}

// Handle create ticket form submission
function handleCreateTicket(e) {
    e.preventDefault();
    
    // Get form values
    const customerName = document.getElementById('customerName').value.trim();
    const ticketTitle = document.getElementById('ticketTitle').value.trim();
    const ticketPosition = document.getElementById('ticketPosition').value;
    
    // Validate form
    let isValid = true;
    
    if (!customerName) {
        document.getElementById('customerNameError').textContent = 'Customer name is required';
        isValid = false;
    } else {
        document.getElementById('customerNameError').textContent = '';
    }
    
    if (!ticketTitle) {
        document.getElementById('ticketTitleError').textContent = 'Ticket title is required';
        isValid = false;
    } else {
        document.getElementById('ticketTitleError').textContent = '';
    }
    
    if (!isValid) return;
    
    // Create new ticket
    const newTicket = {
        id: generateId(),
        customerName,
        title: ticketTitle,
        position: ticketPosition,
        createdAt: new Date().toISOString()
    };
    
    // Add ticket to storage
    const tickets = getTicketsFromStorage();
    tickets.push(newTicket);
    saveTicketsToStorage(tickets);
    
    // Add ticket to column
    addTicketToColumn(newTicket);
    
    // Update ticket counts
    updateTicketCounts();
    
    // Show success toast
    showToast(`Ticket "${ticketTitle}" created successfully`, 'success');
    
    // Close modal
    closeCreateTicketModal();
}

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Drag and drop functionality
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    e.target.classList.add('dragging');
    
    // Set drag image (optional)
    const dragImage = e.target.cloneNode(true);
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    setTimeout(() => {
        document.body.removeChild(dragImage);
    }, 0);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function allowDrop(e) {
    e.preventDefault();
    
    // Add highlight to drop target
    if (e.target.classList.contains('column-content')) {
        e.target.classList.add('drag-over');
    }
}

function drop(e, targetPosition) {
    e.preventDefault();
    
    // Remove highlight from drop target
    const columns = document.querySelectorAll('.column-content');
    columns.forEach(column => {
        column.classList.remove('drag-over');
    });
    
    const ticketId = e.dataTransfer.getData('text/plain');
    const ticketElement = document.getElementById(ticketId);
    
    if (!ticketElement) return;
    
    // Get source position
    const tickets = getTicketsFromStorage();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return;
    
    const sourcePosition = ticket.position;
    
    // Check if trying to move to Closed from another section
    if (targetPosition === 'Closed' && sourcePosition !== 'Closed') {
        showToast('Tickets cannot be moved directly to the Closed section', 'error');
        return;
    }
    
    // Update ticket position in storage
    ticket.position = targetPosition;
    saveTicketsToStorage(tickets);
    
    // Move ticket element to target column
    const targetColumnId = targetPosition.replace(' ', '');
    const targetColumn = document.querySelector(`#${targetColumnId} .column-content`);
    
    if (targetColumn) {
        targetColumn.appendChild(ticketElement);
        
        // Update ticket position class
        const positionSpan = ticketElement.querySelector('.ticket-position');
        if (positionSpan) {
            // Remove old position class
            positionSpan.className = 'ticket-position';
            // Add new position class
            positionSpan.classList.add(`position-${targetPosition.replace(' ', '-')}`);
            positionSpan.textContent = targetPosition;
        }
        
        // Update ticket counts
        updateTicketCounts();
        
        // Show success toast
        showToast(`Ticket moved to ${targetPosition}`, 'success');
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    // Set message
    toastMessage.textContent = message;
    
    // Set type
    toast.className = 'toast';
    if (type === 'error') {
        toast.classList.add('toast-error');
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}