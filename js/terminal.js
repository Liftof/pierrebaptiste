document.addEventListener('DOMContentLoaded', () => {
    const outputElement = document.getElementById('output');
    const commandInput = document.getElementById('commandInput');
    const terminalElement = document.getElementById('terminal');

    const welcomeMessage = `Welcome to PBB-OS v1.0
Type 'help' to see available commands.
--------------------------------------`;

    function displayOutput(text, isCommand = false) {
        const div = document.createElement('div');
        if (isCommand) {
            const promptSpan = document.createElement('span');
            promptSpan.className = 'prompt';
            promptSpan.textContent = 'PBB-OS:~ guest$ ';
            div.appendChild(promptSpan);
            div.appendChild(document.createTextNode(text));
        } else {
            // For multi-line output or HTML content
            div.innerHTML = text.replace(/\n/g, '<br>');
        }
        outputElement.appendChild(div);
        terminalElement.scrollTop = terminalElement.scrollHeight; // Auto-scroll
    }

    function clearOutput() {
        outputElement.innerHTML = '';
    }

    const commands = {
        help: () => {
            displayOutput(`Available commands:
  help         - Show this help message
  whois        - Display information about Pierre-Baptiste Borges
  connect      - Show social media and professional links
  resume       - Open resume
  playlists    - List Spotify playlists
  clear        - Clear the terminal screen
  theme        - (Coming soon) Change terminal theme`);
        },
        whois: () => {
            displayOutput(`Pierre-Baptiste Borges
Digital explorer, creator, and enthusiast.
Currently navigating the digital landscape from [Your Location/Affiliation - if you want to add].
This terminal is a glimpse into my world.`);
        },
        connect: () => {
            displayOutput(`Connect with Pierre-Baptiste:
  <a href="https://www.linkedin.com/in/pierrebaptisteborges/" target="_blank">LinkedIn</a>
  <a href="https://twitter.com/pierbapt" target="_blank">Twitter</a>
  <a href="https://medium.com/@pierrebaptiste-borges" target="_blank">Medium</a>
  <a href="https://www.instagram.com/pb.bor/" target="_blank">Instagram</a>`);
        },
        resume: () => {
            displayOutput('Opening resume...');
            window.open('files/Resume_BORGES_PierreBaptiste-2022.pdf', '_blank');
        },
        playlists: () => {
            displayOutput(`Spotify Playlists:
  <a href="https://open.spotify.com/playlist/4hnRnG9BiowYdy8DfcmeR1" target="_blank">Playlist 1</a>
  <a href="https://open.spotify.com/playlist/2TCIPO3tZPwlHPepxPwEji" target="_blank">Playlist 2</a>
  <a href="https://open.spotify.com/playlist/6K6hcekkdpXrys8FM6JZsr" target="_blank">Playlist 3</a>
  <a href="https://open.spotify.com/playlist/2K64c4XOn7oU07mwJMmIXq" target="_blank">Playlist 4</a>
  <a href="https://open.spotify.com/playlist/4diQDIVvy9Mc2RvPGtWpiQ" target="_blank">Playlist 5</a>
  <a href="https://open.spotify.com/playlist/1phi9ufzLASdjw9B1CplRi" target="_blank">Playlist 6</a>`);
        },
        clear: () => {
            clearOutput();
            displayOutput(welcomeMessage); // Show welcome again after clear
        },
        theme: () => {
            displayOutput('Theme functionality is coming soon!');
        }
    };

    commandInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const commandText = commandInput.value.trim().toLowerCase();
            displayOutput(commandInput.value, true); // Display the typed command
            commandInput.value = '';

            if (commandText) {
                if (commands[commandText]) {
                    commands[commandText]();
                } else {
                    displayOutput(`Error: command not found: ${commandText}. Type 'help'.`);
                }
            }
            terminalElement.scrollTop = terminalElement.scrollHeight; // Ensure scroll after command
        }
    });

    // Initial welcome message
    displayOutput(welcomeMessage);
    commandInput.focus(); // Focus on input on load

    // Allow clicking on terminal to focus input
    terminalElement.addEventListener('click', () => {
        commandInput.focus();
    });
});
