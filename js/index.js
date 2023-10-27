var search_terms = ['hurricane', 'hungry', 'tsunami', 'earthquake', 'hospital', 'fire', 'tornado', 'blizzard', 'homeless', 'food', 'flood', 'sandstorm', 'shelter', 'post-disaster shelters'];
let chosenEmergency;

function autocompleteMatch(input) {
  input = input.toLowerCase();
  if (input == '') {
    return [];
  }
  var reg = new RegExp(input)
  return search_terms.filter(function(term) {
	  if (term.match(reg)) {
  	  return term;
	  }
  });
}

function showResults(val) {
  res = document.getElementById("autocomplete-results");
  res.innerHTML = '';
  let list = '';
  let terms = autocompleteMatch(val);
  for (i=0; i<terms.length; i++) {
    list += '<li onclick="setSearchbarText(\''+ terms[i]+'\')">' + terms[i] + '</li>';
  }
  res.innerHTML = '<ul>' + list + '</ul>';
}

function setSearchbarText(text) {
  let searchbar = document.getElementById("emergency-search");
  searchbar.value = "" + text;
  showResults("");
  searchbar.focus();
}

function searchbarOnKeyPress(e) {
  let searchbar = document.getElementById("emergency-search");
  if (e.key == "Enter") {
    if (search_terms.includes(searchbar.value)) {
      chosenEmergency = searchbar.value;
      // accesible by map.js
    } else {
      // if empty or other value
      // basically redirects to map normally
      chosenEmergency = "invalid entry"
    }
    // send to map
    // NOTE: doesn't work locally, only on internet
    window.location.replace("/map/index.html");
  }
}