// Sound Box - Visual Audio Player

document.addEventListener('DOMContentLoaded', function() {
    // Sound library
    const soundLibrary = [
        { id: 'sound1', name: 'Allez-hop', fileName: 'Allez-hop.mp3' },
        { id: 'sound2', name: 'Tchack', fileName: 'tchack.mp3' },
        { id: 'sound3', name: 'Coucou', fileName: 'Coucou.mp3' },
        { id: 'sound4', name: 'TQT', fileName: 'tqt.mp3' },
        { id: 'sound5', name: 'Souhaits', fileName: 'souhaits.mp3' }
    ];
    
    // Current active card
    let activeCard = null;
    // Animation timeout
    let animationTimeout = null;
    
    // Generate sound grid
    const soundGrid = document.querySelector('.sound-grid');
    
    // Create sound cards
    soundLibrary.forEach(sound => {
        // Create card
        const card = document.createElement('div');
        card.className = 'sound-card';
        card.dataset.soundId = sound.id;
        
        // Add sound name
        const soundName = document.createElement('div');
        soundName.className = 'sound-name';
        soundName.textContent = sound.name;
        
        // Add sound indicator
        const indicator = document.createElement('div');
        indicator.className = 'sound-indicator';
        for (let i = 0; i < 4; i++) {
            const bar = document.createElement('span');
            indicator.appendChild(bar);
        }
        
        // Add card to grid
        card.appendChild(soundName);
        card.appendChild(indicator);
        soundGrid.appendChild(card);
        
        // Add click event
        card.addEventListener('click', () => handleCardClick(card, sound));
    });
    
    // Handle card click
    function handleCardClick(card, sound) {
        // If same card is active, deactivate it
        if (activeCard === card) {
            deactivateCard();
            return;
        }
        
        // Deactivate current card if any
        deactivateCard();
        
        // Activate new card with visual feedback
        activateCard(card, sound);
        
        // Try to play sound (visual feedback will still work even if sound fails)
        tryPlaySound(sound);
    }
    
    // Activate card with visual feedback
    function activateCard(card, sound) {
        card.classList.add('playing');
        activeCard = card;
        
        // Auto-deactivate after 3 seconds to simulate sound duration
        if (animationTimeout) {
            clearTimeout(animationTimeout);
        }
        
        animationTimeout = setTimeout(() => {
            deactivateCard();
        }, 3000);
    }
    
    // Deactivate current card
    function deactivateCard() {
        if (activeCard) {
            activeCard.classList.remove('playing');
            activeCard = null;
        }
        
        if (animationTimeout) {
            clearTimeout(animationTimeout);
            animationTimeout = null;
        }
    }
    
    // Try to play sound but don't rely on it
    function tryPlaySound(sound) {
        try {
            // Attempt to play the sound, but don't rely on it working
            const audio = new Audio(`./sounds/${sound.fileName}`);
            
            console.log(`Attempting to play ${sound.name}`);
            
            // Just fire and forget - the visual feedback is the priority
            audio.play().catch(err => {
                console.log(`Note: Sound ${sound.name} didn't play, but that's okay.`);
            });
        } catch (e) {
            // Just log and continue - we prioritize the UI working
            console.log(`Note: Sound playback not supported, but the UI works!`);
        }
    }
});
