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
  showResults("");
  searchbar.focus();
}

/**
 * 
 * usingButton => boolean value for whether or not button was used 
 */
function searchbarOnKeyPress(e, usingButton) {
  if (e.key == "Enter" || usingButton) {
    let searchbar = document.getElementById("emergency-search");
    if (search_terms.includes(searchbar.value)) {
      window.localStorage.setItem("emergency", searchbar.value)
      // accessible by map.js by employing local storage
    } else {
      // if empty or other value
      // basically redirects to map normally
      window.localStorage.setItem("emergency", "Invalid entry.")
    }
    alert(window.localStorage.getItem("emergency"))
   // send to map
    // NOTE: doesn't work locally, only on internet
    document.location.href = "/map/index.html";
  }
}