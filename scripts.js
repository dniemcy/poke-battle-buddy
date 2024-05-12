const colours = {
	normal: '#A8A77A',
	fire: '#EE8130',
	water: '#6390F0',
	electric: '#F7D02C',
	grass: '#7AC74C',
	ice: '#96D9D6',
	fighting: '#C22E28',
	poison: '#A33EA1',
	ground: '#E2BF65',
	flying: '#A98FF3',
	psychic: '#F95587',
	bug: '#A6B91A',
	rock: '#B6A136',
	ghost: '#735797',
	dragon: '#6F35FC',
	dark: '#705746',
	steel: '#B7B7CE',
	fairy: '#D685AD',
};

const attackMatchups = {
    "normal": ["fighting"],
    "fire": ["water", "rock", "ground"],
    "water": ["electric", "grass"],
    "electric": ["ground"],
    "grass": ["fire", "ice", "poison", "flying", "bug"],
    "ice": ["fire", "fighting", "rock", "steel"],
    "fighting": ["flying", "psychic", "fairy"],
    "poison": ["ground", "psychic"],
    "ground": ["water", "grass", "ice"],
    "flying": ["electric", "ice", "rock"],
    "psychic": ["bug", "ghost", "dark"],
    "bug": ["fire", "flying", "rock"],
    "rock": ["water", "grass", "fighting", "ground", "steel"],
    "ghost": ["ghost", "dark"],
    "dragon": ["ice", "dragon", "fairy"],
    "dark": ["fighting", "bug", "fairy"],
    "steel": ["fire", "fighting", "ground"],
    "fairy": ["poison", "steel"]
};

const defenseMatchups = {
    "normal": [],
    "fire": ["fire", "grass", "ice", "steel", "fairy"],
    "water": ["fire", "water", "ice", "steel"],
    "electric": ["electric", "flying", "steel"],
    "grass": ["water", "electric", "grass", "ground"],
    "ice": ["ice"],
    "fighting": ["bug", "rock", "dark"],
    "poison": ["grass", "fighting", "poison", "bug", "fairy"],
    "ground": ["poison", "rock"],
    "flying": ["grass", "fighting", "bug"],
    "psychic": ["fighting", "psychic"],
    "bug": ["grass", "fighting", "ground"],
    "rock": ["normal", "fire", "poison", "flying"],
    "ghost": ["poison", "bug"],
    "dragon": ["fire", "water", "electric", "grass"],
    "dark": ["ghost", "dark"],
    "steel": ["normal", "grass", "ice", "flying", "psychic", "bug", "rock", "dragon", "steel", "fairy"],
    "fairy": ["fighting", "bug", "dark"]
};

const immunityMatchups = {
    "normal": ["ghost"],
    "fire": [],
    "water": [],
    "electric": [],
    "grass": [],
    "ice": [],
    "fighting": [],
    "poison": [],
    "ground": [],
    "flying": ["ground"],
    "psychic": [],
    "bug": [],
    "rock": [],
    "ghost": ["normal", "fighting"],
    "dragon": [],
    "dark": ["psychic"],
    "steel": ["poison"],
    "fairy": ["dragon"]
}

function fetchPokemonDetails(name) {
    return fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
        .then(response => response.json());
}

searchInput.addEventListener("input", function() {
    const inputValue = searchInput.value.toLowerCase();
    searchDropdown.innerHTML = "";
    pokemonInfoContainer.innerHTML = "";
    if (inputValue.length > 0) {
        fetch(`https://pokeapi.co/api/v2/pokemon/?limit=2000&offset=0`)
            .then(response => response.json())
            .then(data => {
                const matches = data.results.filter(pokemon => pokemon.name.startsWith(inputValue));
                if (matches.length > 0) {
                    matches.sort((a, b) => a.name.localeCompare(b.name)); // Sort dropdown results alphabetically
                    searchDropdown.style.display = "block"; 
                    matches.forEach(pokemon => {
                        fetchPokemonDetails(pokemon.name).then(details => {
                            const dropdownItem = document.createElement("div");
                            dropdownItem.classList.add("dropdown-item");
                            dropdownItem.innerHTML = `
                                <img src="${details.sprites.front_default}" alt="${pokemon.name}" style="width: 70px; height: auto;">
                                <span>${pokemon.name}</span>
                            `;
                            dropdownItem.addEventListener("click", function() {
                                fetchPokemonDetails(pokemon.name).then(pokemonData => {
                                    searchDropdown.style.display = 'none'; // Clear info on click
                                    searchInput.value = '';
                                    displayPokemonDetails(pokemonData);
                                });
                            });
                            searchDropdown.appendChild(dropdownItem);
                        });
                    });
                } else {
                    searchDropdown.style.display = "none";
                }
            })
            .catch(error => {
                console.error("Error fetching data from PokeAPI:", error);
            });
    } else {
        searchDropdown.style.display = "none";
    }
});

/* Display details */
function displayPokemonDetails(pokemonData) {
    /* Center info container */
    pokemonInfoContainer.innerHTML = `
        <h2>${pokemonData.name}</h2>
        <img src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}" style="width: 140px; height: auto;">
        <div id="typeContainer">
            <div id="typeLabel" class="type-label">Type</div> 
            <div id="pokemonType" class="pokemon-type"></div>
        </div>
        <div id="pokemonAbilities" class="abilityContainer">Abilities: 
            ${pokemonData.abilities.map(ability => `<span class="ability" data-url="${ability.ability.url}">${ability.ability.name}</span>`).join(', ')}
            <div id="abilityPopup" class="ability-popup"></div>
        </div>
        <div id="weaknesses">
                <span class="weaknesses-label">Weak to: </span>
                <span id="weaknessTypes"></span>
        </div>
        <div id="resistances">
                <span class="resistances-label">Resistant to: </span>
                <span id="resistanceTypes"></span>
        </div>
        <div id="immunities">
                <span class="immunities-label">Immune to: </span>
                <span id="immunityTypes"></span>
        </div>`;
     
    /* Pokemon's types */    
    const typeContainer = document.getElementById("pokemonType");
    typeContainer.innerHTML = "";
    pokemonData.types.forEach(type => {
        const typeBox = document.createElement("div");
        typeBox.textContent = type.type.name;
        typeBox.style.backgroundColor = colours[type.type.name];
        typeBox.style.border = "1px solid #000000";
        typeContainer.appendChild(typeBox);
    });
    
    /* Abilities with descriptions */
    const abilitySpans = document.querySelectorAll('.ability');
    abilitySpans.forEach(span => {
        span.addEventListener('mouseover', function() {
            console.log('Mouseover event triggered for:', span.textContent);
            const abilityUrl = this.getAttribute('data-url');
            fetch(abilityUrl)
                .then(response => response.json())
                .then(data => {
                    const descriptionEntry = data.flavor_text_entries.find(entry => entry.language.name === 'en');
                    const description = descriptionEntry ? descriptionEntry.flavor_text : 'No description available';
                    const popup = document.getElementById('abilityPopup');
                    popup.textContent = description;
                    popup.style.display = 'block';
                    popup.style.top = (this.offsetTop + this.offsetHeight) + 'px';
                    popup.style.left = this.offsetLeft + 'px';
                })
                .catch(error => {
                    console.error('Error fetching ability description:', error);
                });
        });
    
        span.addEventListener('mouseout', function() {
            document.getElementById('abilityPopup').style.display = 'none';
        });
    });

    /* Weaknesses */
    const weaknessTypesContainer = document.getElementById("weaknessTypes");
    weaknessTypesContainer.innerHTML = ""; 
    const addedWeaknesses = {};
    pokemonData.types.forEach(type => {
        const weaknessesForType = attackMatchups[type.type.name];
        if (weaknessesForType && weaknessesForType.length > 0) {
            weaknessesForType.forEach(weakness => {
                if (!addedWeaknesses[weakness]) {
                    const weaknessSpan = document.createElement("span");
                    weaknessSpan.textContent = weakness;
                    weaknessSpan.style.backgroundColor = colours[weakness];
                    weaknessSpan.style.border = "1px solid #000000";
                    if (hasFourTimesWeakness(pokemonData.types.map(type => type.type.name), weakness)) {
                        weaknessSpan.style.border = "2px solid #000000";
                        weaknessSpan.style.fontWeight = "bold";
                        weaknessSpan.style.boxShadow = "0 0 5px #00ff00";
                    }
                    
                    weaknessTypesContainer.appendChild(weaknessSpan);
                    addedWeaknesses[weakness] = true;
                }
            });
        }
    });

    /* Resistances */
    const resistanceTypesContainer = document.getElementById("resistanceTypes");
    resistanceTypesContainer.innerHTML = ""; 
    const addedResistances = {};
    pokemonData.types.forEach(type => {
        const resistancesForType = defenseMatchups[type.type.name];
        if (resistancesForType && resistancesForType.length > 0) {
            resistancesForType.forEach(resistance => {
                if (!addedResistances[resistance]) {
                    const resistanceSpan = document.createElement("span");
                    resistanceSpan.textContent = resistance;
                    resistanceSpan.style.backgroundColor = colours[resistance];
                    resistanceSpan.style.border = "1px solid #000000";
                    if (hasFourTimesResistance(pokemonData.types.map(type => type.type.name), resistance)) {
                        resistanceSpan.style.border = "2px solid #000000";
                        resistanceSpan.style.fontWeight = "bold";
                        resistanceSpan.style.boxShadow = "0 0 5px #ff0000";
                    }
                    
                    resistanceTypesContainer.appendChild(resistanceSpan);
                    addedResistances[resistance] = true;
                }
            });
        }
    });  
    
    /* Immunities */
    const immunityTypesContainer = document.getElementById("immunityTypes");
    immunityTypesContainer.innerHTML = ""; 
    pokemonData.types.forEach(type => {
        const immunitiesForType = immunityMatchups[type.type.name];
        if (immunitiesForType && immunitiesForType.length > 0) 
            immunitiesForType.forEach(immunity => {
                const immunitySpan = document.createElement("span");
                immunitySpan.textContent = immunity;
                immunitySpan.style.backgroundColor = colours[immunity];
                immunitySpan.style.border = "1px solid #000000";
                immunitySpan.style.opacity = "0.9";
                immunityTypesContainer.appendChild(immunitySpan);
            });
        });
}

function hasFourTimesWeakness(defendingTypes, attackingType) {
    let effectivenessCounter = 0;
    for (const defendingType of defendingTypes) {
        const isWeakToAttacker = attackMatchups[defendingType].includes(attackingType);
        if (isWeakToAttacker) {
            effectivenessCounter++;
        }
    }
    return effectivenessCounter === 2;
}

function hasFourTimesResistance(defendingTypes, attackingType) {
    let effectivenessCounter = 0;
    for (const defendingType of defendingTypes) {
        const isResistantToAttacker = defenseMatchups[defendingType].includes(attackingType);
        if (isResistantToAttacker) {
            effectivenessCounter--;
        }
    }
    return effectivenessCounter === -2;
}


