var search_terms = ['hurricane', 'hungry', 'tsunami', 'earthquake', 'hospital', 'fire', 'tornado', 'blizzard', 'homeless', 'food', 'flood', 'sandstorm', 'shelter', 'post-disaster shelters'];

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
  searchbar.focus();
}

function searchbarOnKeyPress(e) {
  let searchbar = document.getElementById("emergency-search");
  if (e.key == "Enter") {
    if (search_terms.includes(searchbar.value)) {
      alert(searchbar.value);
      // do something with value -> probably process & send
      // to map
    } else {
      alert("Please choose an emergency from the list! Or, go to the map.");
      // maybe remove and just redirect to map
    }
  }
}